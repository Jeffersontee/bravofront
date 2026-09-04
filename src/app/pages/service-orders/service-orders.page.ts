import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, ModalController
} from '@ionic/angular/standalone';
import { ServiceOrder, ServiceOrderService } from 'src/app/services/service-order/service-order.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { CompanyService } from 'src/app/services/company/company.service';
import { UnitService } from 'src/app/services/unit/unit.service';
import { ServiceService } from 'src/app/services/service/service.service';
import { Strings } from 'src/app/enum/strings';
import { ServiceOrderListComponent } from 'src/app/components/service-order-list/service-order-list.component';

@Component({
  selector: 'app-service-orders',
  templateUrl: './service-orders.page.html',
  styleUrls: ['./service-orders.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
    ServiceOrderListComponent
  ]
})
export class ServiceOrdersPage implements OnInit {
  private serviceOrderService = inject(ServiceOrderService);
  private profileService = inject(ProfileService);
  private modalCtrl = inject(ModalController);
  private companyService = inject(CompanyService);
  private unitService = inject(UnitService);
  private serviceService = inject(ServiceService);
  private router = inject(Router);

  orders = signal<ServiceOrder[]>([]);
  isLoading = signal<boolean>(true);
  selectedSegment = signal<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  searchQuery = signal<string>('');
  
  isLojista = signal<boolean>(false);
  canCreateOrder = signal<boolean>(false);
  company = signal<any>(null);
  units = signal<any[]>([]);
  services = signal<any[]>([]);

  Strings = Strings; // para uso no template
 
  ngOnInit() {
    this.loadOrders();
  }

  async openCreateVisitModal() {
    const { VisitModalComponent } = await import('../../components/visit-modal/visit-modal.component');
    const modal = await this.modalCtrl.create({
      component: VisitModalComponent,
      componentProps: {
        company: this.company(),
        units: this.units(),
        services: this.services()
      },
      cssClass: 'custom-visit-modal'
    });
    
    modal.onDidDismiss().then((result: any) => {
      if (result.data && result.data.refresh) {
        this.loadOrders();
      }
    });

    return await modal.present();
  }

  async loadOrders(event?: any) {
    this.isLoading.set(true);
    
    try {
      const userData = await this.profileService.getProfile() as any;
      const filters: { company_id?: string; collaborator_id?: string; user_id?: string } = {};

      if (userData) {
        const isOwner = userData.type === Strings.COMPANY_OWNER_TYPE || userData.type === 'company_owner';
        const isSuper = userData.type === 'super_admin';
        const isOperatorOrSupervisor = (userData.type === 'collaborator' || userData.type === 'admin') && (userData.role === 'operator' || userData.role === 'supervisor');
        const hasCreatePermission = userData.permissions?.includes('SUPER_OPERATIONAL_ORDERS_CREATE') || userData.permissions?.includes('SUPER_OPERATIONAL_CREATE');

        const canCreate = isOwner || isSuper || isOperatorOrSupervisor || hasCreatePermission;
        this.canCreateOrder.set(canCreate);
        this.isLojista.set(isOwner);

        if (userData.type === Strings.USER_TYPE || userData.type === 'user') {
          filters.user_id = userData._id;
        } else if (isOwner) {
          filters.company_id = userData.company_id;
        } else if (userData.type === Strings.COLLABORATOR_TYPE || userData.type === 'collaborator') {
          if (userData.role === 'operator' && userData.company_id) {
            filters.company_id = userData.company_id;
          } else {
            filters.collaborator_id = userData._id;
          }
        }

        // Carrega dados de empresa, unidades e serviços se o usuário tiver autorização para criar OS
        if (canCreate) {
          const companyId = userData.company_id;
          if (companyId) {
            this.companyService.getCompanyById(companyId).subscribe((res: any) => {
              if (res.success && res.data) {
                this.company.set(res.data);
                const activeServiceIds = (res.data.services || []).map((s: any) => typeof s === 'object' ? String(s._id || s.id) : String(s));
                
                this.serviceService.getServices().subscribe((srvRes: any) => {
                  if (srvRes.success) {
                    const allServices = srvRes.data || [];
                    if (activeServiceIds.length > 0) {
                      this.services.set(allServices.filter((s: any) => activeServiceIds.includes(String(s._id || s.id))));
                    } else {
                      this.services.set(allServices.filter((s: any) => !s.company_id || String(s.company_id) === String(companyId)));
                    }
                  }
                });
              }
            });

            this.unitService.getUnits().subscribe((res: any) => {
              if (res.success) {
                this.units.set(res.data.filter((u: any) => u.company_id === companyId || u.company_id?._id === companyId));
              }
            });
          } else {
            // Global: Carrega todos os serviços e unidades
            this.serviceService.getServices().subscribe((srvRes: any) => {
              if (srvRes.success) {
                this.services.set(srvRes.data || []);
              }
            });

            this.unitService.getUnits().subscribe((res: any) => {
              if (res.success) {
                this.units.set(res.data || []);
              }
            });
          }
        }
      }

      this.serviceOrderService.getServiceOrders(filters).subscribe({
        next: (res) => {
          if (res.success) {
            this.orders.set(res.data || []);
          }
          this.isLoading.set(false);
          if (event?.target) event.target.complete();
        },
        error: (err) => {
          console.error('Error fetching service orders', err);
          this.orders.set(this.getMockOrders());
          this.isLoading.set(false);
          if (event?.target) event.target.complete();
        }
      });
    } catch (e) {
      console.error('Error loading profile in service orders list', e);
      this.isLoading.set(false);
      if (event?.target) event.target.complete();
    }
  }

  goToDetails(order: ServiceOrder) {
    if (order._id) {
      const type = (this.profileService.profile() as any)?.type;
      let baseUrl = '';

      if (type === Strings.COMPANY_OWNER_TYPE) {
        baseUrl = Strings.COMPANY_ORDER_DETAILS;
      } else if (type === Strings.COLLABORATOR_TYPE) {
        baseUrl = Strings.COLLABORATOR_ORDER_DETAILS;
      } else if (type === Strings.USER_TYPE) {
        baseUrl = Strings.CUSTOMER_ORDER_DETAILS;
      } else {
        baseUrl = Strings.SUPER_OPERATIONAL_ORDERS_DETAILS;
      }

      this.router.navigateByUrl(`/${baseUrl}/${order._id}`);
    }
  }

  getMockOrders(): ServiceOrder[] {
    return [
      {
        _id: '1',
        company_id: 'c1',
        unit_id: { name: 'Matriz - Centro' } as any,
        service_id: { name: 'Instalação de Câmera CFTV' } as any,
        scheduled_date: new Date().toISOString(),
        current_status: 'AGENDADO'
      },
      {
        _id: '2',
        company_id: 'c2',
        unit_id: { name: 'Filial - Zona Sul' } as any,
        service_id: { name: 'Manutenção de Ar Condicionado' } as any,
        scheduled_date: new Date().toISOString(),
        current_status: 'EM_EXECUCAO'
      },
      {
        _id: '3',
        company_id: 'c1',
        unit_id: { name: 'Matriz - Centro' } as any,
        service_id: { name: 'Cabeamento Estruturado' } as any,
        scheduled_date: new Date(Date.now() - 86400000).toISOString(),
        current_status: 'CONCLUIDO'
      }
    ];
  }
}
