import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  arrowBack, locationOutline, timeOutline, checkmarkCircle, 
  ellipsisHorizontalCircle, playCircle, stopCircle, mapOutline,
  personOutline, buildOutline, businessOutline
} from 'ionicons/icons';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { ServiceOrder, ServiceOrderService } from 'src/app/services/service-order/service-order.service';
import { Strings } from 'src/app/enum/strings';

@Component({
  selector: 'app-service-order-details',
  templateUrl: './service-order-details.page.html',
  styleUrls: ['./service-order-details.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ServiceOrderDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private serviceOrderService = inject(ServiceOrderService);
  private profileService = inject(ProfileService);

  orderId = signal<string>('');
  order = signal<ServiceOrder | null>(null);
  isLoading = signal<boolean>(true);

  // Exposing roles for logic in HTML
  userType = computed(() => (this.profileService.profile() as any)?.type);
  isCollaborator = computed(() => this.userType() === Strings.COLLABORATOR_TYPE);
  isCompanyOwner = computed(() => this.userType() === Strings.COMPANY_OWNER_TYPE);
  isSuperAdmin = computed(() => this.userType() === Strings.SUPER_TYPE);

  // Status computation for actions
  canStartDisplacement = computed(() => this.isCollaborator() && this.order()?.current_status === 'AGENDADO');
  canCheckIn = computed(() => this.isCollaborator() && this.order()?.current_status === 'EM_DESLOCAMENTO');
  canStartExecution = computed(() => this.isCollaborator() && this.order()?.current_status === 'CHECK_IN');
  canFinish = computed(() => this.isCollaborator() && this.order()?.current_status === 'EM_EXECUCAO');

  constructor() {
    addIcons({
      arrowBack, locationOutline, timeOutline, checkmarkCircle, 
      ellipsisHorizontalCircle, playCircle, stopCircle, mapOutline,
      personOutline, buildOutline, businessOutline
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderId.set(id);
      this.loadOrder(id);
    }
  }

  loadOrder(id: string) {
    this.isLoading.set(true);
    this.serviceOrderService.getServiceOrderById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.order.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching details', err);
        this.order.set(this.getMockOrder(id));
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    this.navCtrl.back();
  }

  // --- ACTIONS ---
  updateStatus(newStatus: string) {
    // Implement mock updating for now to demonstrate UI reactivity
    const currentOrder = this.order();
    if (!currentOrder) return;
    
    // Optimistic Update
    const updated = { ...currentOrder, current_status: newStatus as any };
    if (!updated.timeline) updated.timeline = [];
    
    updated.timeline.push({
      status: newStatus as any,
      timestamp: new Date().toISOString()
    });
    
    this.order.set(updated);

    // TODO: Connect to Real Backend call
    // this.serviceOrderService.updateStatus(this.orderId(), newStatus).subscribe(...)
  }

  // --- HELPERS ---
  getStatusColor(status: string): string {
    switch (status) {
      case 'AGENDADO': return 'medium';
      case 'EM_DESLOCAMENTO': return 'tertiary';
      case 'CHECK_IN': return 'warning';
      case 'EM_EXECUCAO': return 'warning';
      case 'CONCLUIDO': return 'success';
      case 'CANCELADO': return 'danger';
      default: return 'medium';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'AGENDADO': return 'Agendado';
      case 'EM_DESLOCAMENTO': return 'Deslocamento';
      case 'CHECK_IN': return 'Check-in Efetuado';
      case 'EM_EXECUCAO': return 'Em Execução';
      case 'CONCLUIDO': return 'Concluído';
      case 'CANCELADO': return 'Cancelado';
      default: return status;
    }
  }

  isPastStatus(status: string): boolean {
    const sequence = ['AGENDADO', 'EM_DESLOCAMENTO', 'CHECK_IN', 'EM_EXECUCAO', 'CONCLUIDO'];
    const currentStatus = this.order()?.current_status;
    if (!currentStatus || currentStatus === 'CANCELADO') return false;
    
    const currentIndex = sequence.indexOf(currentStatus);
    const checkIndex = sequence.indexOf(status);
    
    return checkIndex <= currentIndex;
  }

  getMockOrder(id: string): ServiceOrder {
    return {
      _id: id,
      company_id: { name: 'Empresa Alpha Ltda' } as any,
      unit_id: { name: 'Loja Principal - Centro', address: 'Av. Paulista, 1000' } as any,
      service_id: { name: 'Instalação de Câmera CFTV', description: 'Instalação e configuração de 4 câmeras IP' } as any,
      collaborator_id: { name: 'Carlos Técnico' } as any,
      scheduled_date: new Date().toISOString(),
      current_status: 'EM_DESLOCAMENTO',
      timeline: [
        { status: 'AGENDADO', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { status: 'EM_DESLOCAMENTO', timestamp: new Date().toISOString() }
      ]
    };
  }
}
