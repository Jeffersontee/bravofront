import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
  IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonToggle, IonLabel,
  IonSpinner, IonList, IonItem, IonIcon
} from '@ionic/angular/standalone';
import { ServiceService, ServiceItem } from 'src/app/services/service/service.service';
import { CompanyService } from 'src/app/services/company/company.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { 
  layersOutline, buildOutline, checkmarkCircleOutline, 
  closeCircleOutline, settingsOutline
} from 'ionicons/icons';

interface CatalogServiceItem extends ServiceItem {
  isActive: boolean;
}

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.page.html',
  styleUrls: ['./catalog.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
    IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonToggle, IonLabel,
    IonSpinner, IonList, IonItem, IonIcon
  ]
})
export class CatalogPage implements OnInit {
  private route = inject(ActivatedRoute);
  private serviceService = inject(ServiceService);
  private companyService = inject(CompanyService);
  private global = inject(GlobalService);

  companyId = signal<string>('');
  companyName = signal<string>('');
  services = signal<CatalogServiceItem[]>([]);
  isLoading = signal<boolean>(true);

  constructor() {
    addIcons({ 
      layersOutline, buildOutline, checkmarkCircleOutline, 
      closeCircleOutline, settingsOutline 
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.companyId.set(id);
      this.loadCatalogData(id);
    }
  }

  loadCatalogData(companyId: string) {
    this.isLoading.set(true);

    // Carrega em paralelo todos os serviços da Bravo e as informações da empresa
    this.companyService.getCompanyById(companyId).subscribe({
      next: (companyRes) => {
        if (companyRes.success && companyRes.data) {
          this.companyName.set(companyRes.data.name);
          const activeServiceIds = companyRes.data.services || [];

          this.serviceService.getServices().subscribe({
            next: (servicesRes) => {
              if (servicesRes.success) {
                // Filtra apenas serviços que estão ativos no catálogo global da Bravo
                const globalServices = (servicesRes.data || []).filter(s => s.status === 'ACTIVE');
                
                const mapped = globalServices.map(s => ({
                  ...s,
                  isActive: activeServiceIds.includes(s._id!)
                }));

                this.services.set(mapped);
              }
              this.isLoading.set(false);
            },
            error: (err) => {
              console.error('Erro ao carregar catálogo de serviços:', err);
              this.isLoading.set(false);
            }
          });
        } else {
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Erro ao buscar dados da empresa:', err);
        this.isLoading.set(false);
      }
    });
  }

  toggleService(service: CatalogServiceItem, event: any) {
    const isChecked = event.detail.checked;
    
    // Atualiza o estado visual localmente
    const updatedServices = this.services().map(s => {
      if (s._id === service._id) {
        return { ...s, isActive: isChecked };
      }
      return s;
    });
    this.services.set(updatedServices);

    // Filtra todos os IDs dos serviços marcados como ativos
    const activeServiceIds = updatedServices
      .filter(s => s.isActive)
      .map(s => s._id as string);

    // Envia a nova lista de serviços para o backend
    this.companyService.updateCompanyServices(this.companyId(), activeServiceIds).subscribe({
      next: (res) => {
        if (res.success) {
          const actionText = isChecked ? 'habilitado' : 'desabilitado';
          this.global.successToast(`Serviço "${service.name}" ${actionText} com sucesso!`);
        }
      },
      error: (err) => {
        console.error('Erro ao atualizar serviços da empresa:', err);
        this.global.errorToast('Não foi possível salvar a alteração. Tente novamente.');
        // Reverte o estado visual em caso de falha no backend
        const reverted = this.services().map(s => {
          if (s._id === service._id) {
            return { ...s, isActive: !isChecked };
          }
          return s;
        });
        this.services.set(reverted);
      }
    });
  }
}
