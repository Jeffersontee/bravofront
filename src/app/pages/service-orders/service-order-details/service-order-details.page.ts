import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, AlertController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  arrowBack, locationOutline, timeOutline, checkmarkCircle, 
  ellipsisHorizontalCircle, playCircle, stopCircle, mapOutline,
  personOutline, buildOutline, businessOutline, closeCircleOutline,
  checkmarkDoneOutline, calendarOutline
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
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  orderId = signal<string>('');
  order = signal<ServiceOrder | null>(null);
  isLoading = signal<boolean>(true);

  // Exposing roles for logic in HTML
  userType = computed(() => (this.profileService.profile() as any)?.type);
  isCollaborator = computed(() => this.userType() === Strings.COLLABORATOR_TYPE);
  isCompanyOwner = computed(() => this.userType() === Strings.COMPANY_OWNER_TYPE);
  isSuperAdmin = computed(() => this.userType() === Strings.SUPER_TYPE);
  isNormalUser = computed(() => this.userType() === 'user');

  // Status computation for actions
  canStartDisplacement = computed(() => this.isCollaborator() && this.order()?.current_status === 'AGENDADO');
  canCheckIn = computed(() => this.isCollaborator() && this.order()?.current_status === 'EM_DESLOCAMENTO');
  canStartExecution = computed(() => this.isCollaborator() && this.order()?.current_status === 'CHECK_IN');
  canFinish = computed(() => this.isCollaborator() && this.order()?.current_status === 'EM_EXECUCAO');

  constructor() {
    addIcons({
      arrowBack, locationOutline, timeOutline, checkmarkCircle, 
      ellipsisHorizontalCircle, playCircle, stopCircle, mapOutline,
      personOutline, buildOutline, businessOutline, closeCircleOutline,
      checkmarkDoneOutline, calendarOutline
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
    this.isLoading.set(true);
    this.serviceOrderService.updateStatus(this.orderId(), newStatus).subscribe({
      next: (res) => {
        if (res.success) {
          this.order.set(res.data);
          this.showToast(`Status atualizado para ${this.getStatusLabel(newStatus)}`);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error updating status', err);
        this.isLoading.set(false);
      }
    });
  }

  // Super Admin: Propor preço de negociação e data provável
  async proposePriceAndDate() {
    const alert = await this.alertCtrl.create({
      header: 'Enviar Proposta Comercial',
      inputs: [
        {
          name: 'client_price',
          type: 'number',
          placeholder: 'Valor para o Lojista (R$)'
        },
        {
          name: 'technician_price',
          type: 'number',
          placeholder: 'Repasse do Técnico (R$)'
        },
        {
          name: 'scheduled_date',
          type: 'datetime-local',
          placeholder: 'Data Provável'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar Proposta',
          handler: (data) => {
            if (!data.client_price || !data.scheduled_date) {
              this.showToast('Por favor, preencha o valor e a data provável.');
              return false;
            }
            this.isLoading.set(true);
            const payload: any = {
              client_price: Number(data.client_price),
              technician_price: Number(data.technician_price || 0),
              scheduled_date: new Date(data.scheduled_date).toISOString(),
              current_status: 'PROPOSTO'
            };
            this.serviceOrderService.updateServiceOrder(this.orderId(), payload).subscribe({
              next: (res) => {
                if (res.success) {
                  this.order.set(res.data);
                  this.showToast('Proposta comercial enviada com sucesso!');
                }
                this.isLoading.set(false);
              },
              error: () => this.isLoading.set(false)
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  // Super Admin: Sugerir Nova Data/Horário
  async suggestNewDateSuper() {
    const alert = await this.alertCtrl.create({
      header: 'Sugerir Nova Data/Horário',
      inputs: [
        {
          name: 'scheduled_date',
          type: 'datetime-local',
          placeholder: 'Nova Data Provável'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sugerir',
          handler: (data) => {
            if (!data.scheduled_date) return false;
            this.isLoading.set(true);
            this.serviceOrderService.updateServiceOrder(this.orderId(), {
              scheduled_date: new Date(data.scheduled_date).toISOString(),
              current_status: 'DATA_SUGERIDA'
            }).subscribe({
              next: (res) => {
                if (res.success) {
                  this.order.set(res.data);
                  this.showToast('Nova data sugerida ao cliente.');
                }
                this.isLoading.set(false);
              },
              error: () => this.isLoading.set(false)
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  // Lojista / User: Aceitar valor comercial e data da proposta
  approvePriceAndDate() {
    this.updateStatus('APROVADO');
  }

  // Lojista / User: Contraproposta ou Sugerir Outra Data
  async proposeNewDateClient() {
    const alert = await this.alertCtrl.create({
      header: 'Sugerir Outra Data',
      subHeader: 'Proponha uma data e horário de preferência:',
      inputs: [
        {
          name: 'scheduled_date',
          type: 'datetime-local'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar Sugestão',
          handler: (data) => {
            if (!data.scheduled_date) return false;
            this.isLoading.set(true);
            this.serviceOrderService.updateServiceOrder(this.orderId(), {
              scheduled_date: new Date(data.scheduled_date).toISOString(),
              current_status: 'SOLICITADO'
            }).subscribe({
              next: (res) => {
                if (res.success) {
                  this.order.set(res.data);
                  this.showToast('Sugestão de agenda enviada para a Central.');
                }
                this.isLoading.set(false);
              },
              error: () => this.isLoading.set(false)
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  // Cancelar Chamado
  cancelOrder() {
    this.updateStatus('CANCELADO');
  }

  // Recusar Chamado
  rejectProposal() {
    this.updateStatus('RECUSADO');
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'dark'
    });
    await toast.present();
  }

  // --- HELPERS ---
  getStatusColor(status: string): string {
    switch (status) {
      case 'SOLICITADO': return 'medium';
      case 'DATA_SUGERIDA': return 'warning';
      case 'PROPOSTO': return 'primary';
      case 'APROVADO': return 'success';
      case 'AGENDADO': return 'secondary';
      case 'EM_DESLOCAMENTO': return 'tertiary';
      case 'CHECK_IN': return 'warning';
      case 'EM_EXECUCAO': return 'warning';
      case 'CONCLUIDO': return 'success';
      case 'CANCELADO': return 'danger';
      case 'RECUSADO': return 'danger';
      default: return 'medium';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'SOLICITADO': return 'Solicitado / Pendente';
      case 'DATA_SUGERIDA': return 'Nova Data Sugerida';
      case 'PROPOSTO': return 'Proposta de Valor';
      case 'APROVADO': return 'Aprovado Lojista';
      case 'AGENDADO': return 'Agendado';
      case 'EM_DESLOCAMENTO': return 'Técnico a caminho';
      case 'CHECK_IN': return 'Técnico no local';
      case 'EM_EXECUCAO': return 'Em Execução';
      case 'CONCLUIDO': return 'Concluído';
      case 'CANCELADO': return 'Cancelado';
      case 'RECUSADO': return 'Recusado';
      default: return status;
    }
  }

  isPastStatus(status: string): boolean {
    const sequence = ['SOLICITADO', 'APROVADO', 'AGENDADO', 'EM_DESLOCAMENTO', 'CHECK_IN', 'EM_EXECUCAO', 'CONCLUIDO'];
    const currentStatus = this.order()?.current_status;
    if (!currentStatus || currentStatus === 'CANCELADO' || currentStatus === 'RECUSADO') return false;
    
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
        { status: 'SOLICITADO', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { status: 'AGENDADO', timestamp: new Date(Date.now() - 1800000).toISOString() },
        { status: 'EM_DESLOCAMENTO', timestamp: new Date().toISOString() }
      ]
    };
  }
}
