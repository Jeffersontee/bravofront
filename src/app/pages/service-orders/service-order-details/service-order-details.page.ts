import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, AlertController, ToastController, ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  arrowBack, locationOutline, timeOutline, checkmarkCircle, 
  ellipsisHorizontalCircle, playCircle, stopCircle, mapOutline,
  personOutline, buildOutline, businessOutline, closeCircleOutline,
  checkmarkDoneOutline, calendarOutline,
  carOutline,
  documentTextOutline,
  ribbonOutline,
  star,
  starOutline,
  warning,
  alertCircleOutline,
  addOutline,
  trashOutline,
  cashOutline,
  time
} from 'ionicons/icons';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { ServiceOrder, ServiceOrderService } from 'src/app/services/service-order/service-order.service';
import { CollaboratorService } from 'src/app/services/collaborator/collaborator.service';
import { Strings } from 'src/app/enum/strings';
import { ServiceService } from 'src/app/services/service/service.service';

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
  private modalCtrl = inject(ModalController);
  private collaboratorService = inject(CollaboratorService);
  private serviceService = inject(ServiceService);

  orderId = signal<string>('');
  order = signal<any | null>(null);
  isLoading = signal<boolean>(true);

  // Cronômetro de Checkout (10 min)
  countdownText = signal<string>('');
  private timerIntervalId: any = null;

  // Intervalo de reatividade de 30 min da OS
  currentTime = signal<number>(Date.now());
  private timeUpdateInterval: any = null;

  isCheckoutTimeOver30Min = computed(() => {
    const os = this.order();
    this.currentTime();
    if (!os || !os.checkout_time) return true;
    const checkoutTime = new Date(os.checkout_time).getTime();
    const difference = Date.now() - checkoutTime;
    return difference > (30 * 60 * 1000); // 30 minutos
  });

  // Catálogo de Serviços para Aditivos do Técnico
  catalogServices = signal<any[]>([]);

  // Avaliação do Lojista
  ratingStars = signal<number>(0);
  ratingComment = signal<string>('');
  hasRated = signal<boolean>(false);

  // Campos para designação do técnico e data/hora
  collaborators = signal<any[]>([]);
  selectedCollaboratorId = signal<string>('');
  selectedScheduleDate = signal<string>('');

  // Exposing roles for logic in HTML
  userType = computed(() => (this.profileService.profile() as any)?.type);
  isCollaborator = computed(() => this.userType() === Strings.COLLABORATOR_TYPE);
  isCompanyOwner = computed(() => this.userType() === Strings.COMPANY_OWNER_TYPE);
  isSuperAdmin = computed(() => this.userType() === Strings.SUPER_TYPE);
  isNormalUser = computed(() => this.userType() === 'user');

  // Status computation for actions
  canStartDisplacement = computed(() => {
    const os = this.order();
    if (!os) return false;
    return this.isCollaborator() && (os.current_status === 'AGENDADO' || os.current_status === 'APROVADO');
  });
  canCheckIn = computed(() => this.isCollaborator() && this.order()?.current_status === 'EM_DESLOCAMENTO');
  canStartExecution = computed(() => this.isCollaborator() && this.order()?.current_status === 'CHECK_IN');
  canFinish = computed(() => this.isCollaborator() && this.order()?.current_status === 'EM_EXECUCAO');

  constructor() {
    addIcons({
      arrowBack, locationOutline, timeOutline, checkmarkCircle, 
      ellipsisHorizontalCircle, playCircle, stopCircle, mapOutline,
      personOutline, buildOutline, businessOutline, closeCircleOutline,
      checkmarkDoneOutline, calendarOutline, carOutline, documentTextOutline,
      ribbonOutline, star, starOutline, warning, alertCircleOutline, addOutline,
      trashOutline, cashOutline, time
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderId.set(id);
      this.loadOrder(id);
    }
    this.timeUpdateInterval = setInterval(() => {
      this.currentTime.set(Date.now());
    }, 10000);
  }

  ngOnDestroy() {
    this.clearTimer();
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }

  private clearTimer() {
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  loadOrder(id: string) {
    this.isLoading.set(true);
    this.clearTimer();

    this.serviceOrderService.getServiceOrderById(id).subscribe({
      next: (res) => {
        if (res.success) {
          const os = res.data;
          this.order.set(os);
          this.hasRated.set(!!os.client_comment || !!os.client_stars);
          
          if (os.collaborator_id) {
            this.selectedCollaboratorId.set(typeof os.collaborator_id === 'object' ? os.collaborator_id._id : os.collaborator_id);
          }
          if (os.proposed_date) {
            const date = new Date(os.proposed_date);
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset*60*1000));
            this.selectedScheduleDate.set(localDate.toISOString().slice(0, 16));
          } else if (os.scheduled_date) {
            const date = new Date(os.scheduled_date);
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset*60*1000));
            this.selectedScheduleDate.set(localDate.toISOString().slice(0, 16));
          }

          // Se estiver em RELATORIO_CHECKOUT, iniciar contagem regressiva de 10 min
          if (os.current_status === 'RELATORIO_CHECKOUT' && os.checkout_time) {
            this.startCountdown(os.checkout_time);
          }

          // Carrega colaboradores se for Super Admin
          if (this.isSuperAdmin()) {
            this.collaboratorService.getCollaborators().subscribe({
              next: (colRes) => {
                if (colRes.success) {
                  this.collaborators.set(colRes.data || []);
                }
              }
            });
          }

          // Carrega catálogo de serviços se for colaborador técnico
          if (this.isCollaborator()) {
            this.serviceService.getServices().subscribe({
              next: (servRes) => {
                if (servRes.success) {
                  this.catalogServices.set(servRes.data || []);
                }
              }
            });
          }
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

  private startCountdown(checkoutTimeStr: string | Date) {
    const checkoutTime = new Date(checkoutTimeStr).getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = checkoutTime + (10 * 60 * 1000) - now; // 10 min

      if (difference <= 0) {
        this.countdownText.set('Tempo esgotado! Aprovação automática.');
        this.clearTimer();
        
        // Auto aprovar se o tempo acabar
        if (this.order()?.current_status === 'RELATORIO_CHECKOUT') {
          this.autoApproveAfterTimeout();
        }
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      const minStr = minutes < 10 ? '0' + minutes : minutes;
      const secStr = seconds < 10 ? '0' + seconds : seconds;
      
      this.countdownText.set(`${minStr}:${secStr}`);
    };

    updateTimer();
    this.timerIntervalId = setInterval(updateTimer, 1000);
  }

  private autoApproveAfterTimeout() {
    this.isLoading.set(true);
    // Envia assinatura em branco
    this.serviceOrderService.evaluateOrder(this.orderId(), {
      follower_signature: '[Aprovação Automática - Timeout 10 min]',
      stars: 3, // Nota neutra automática
      comment: 'Finalização automática por timeout de assinatura presencial.'
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.order.set(res.data);
          this.showToast('OS finalizada automaticamente por timeout!');
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
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

  async openFinishModal() {
    const { ServiceOrderFinishModalComponent } = await import('../../../components/service-order-finish-modal/service-order-finish-modal.component');
    const modal = await this.modalCtrl.create({
      component: ServiceOrderFinishModalComponent,
      componentProps: {
        orderId: this.orderId()
      },
      cssClass: 'custom-finish-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.refresh) {
        this.loadOrder(this.orderId());
      }
    });

    return await modal.present();
  }

  async openReportModal() {
    const { ServiceOrderReportModalComponent } = await import('../../../components/service-order-report-modal/service-order-report-modal.component');
    const modal = await this.modalCtrl.create({
      component: ServiceOrderReportModalComponent,
      componentProps: {
        order: this.order()
      },
      cssClass: 'custom-report-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.refresh) {
        this.loadOrder(this.orderId());
      }
    });

    return await modal.present();
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
              next: (res: any) => {
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
              next: (res: any) => {
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
              next: (res: any) => {
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

  // Super Admin: Confirmar designação do técnico e data de agendamento (move status para AGENDADO)
  async confirmAndSchedule() {
    const collId = this.selectedCollaboratorId();
    const dateStr = this.selectedScheduleDate();

    if (!collId) {
      this.showToast('Por favor, selecione um técnico.');
      return;
    }
    if (!dateStr) {
      this.showToast('Por favor, informe a data e horário do agendamento.');
      return;
    }

    // Help informativo sobre prazo de 8h antes do agendamento
    const alert = await this.alertCtrl.create({
      header: 'Aviso Importante (Prazo de Troca) ⚠️',
      message: 'Atenção: A troca deste técnico só será permitida pelo sistema até 8 horas antes do horário agendado de início do atendimento. Lojistas e profissionais serão notificados por push.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar Agendamento',
          handler: () => {
            this.isLoading.set(true);
            this.serviceOrderService.assignTechnician(this.orderId(), collId, new Date(dateStr).toISOString()).subscribe({
              next: (res: any) => {
                if (res.success) {
                  this.order.set(res.data);
                  this.showToast('Ordem de serviço agendada e técnico designado!');
                }
                this.isLoading.set(false);
              },
              error: (err: any) => {
                const errMsg = err?.error?.message || 'Erro ao designar técnico.';
                this.showToast(errMsg);
                this.isLoading.set(false);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  // Lojista / User / Super: Aceitar sugestão de horário do super
  acceptScheduleProposal() {
    this.isLoading.set(true);
    this.serviceOrderService.acceptSchedule(this.orderId()).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.order.set(res.data);
          this.showToast('Agendamento aceito com sucesso!');
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  // Lojista / User: Recusar e propor nova data
  async proposeNewScheduleClient() {
    const alert = await this.alertCtrl.create({
      header: 'Propor Nova Data/Horário',
      inputs: [
        {
          name: 'new_date',
          type: 'datetime-local'
        }
      ],
      buttons: [
        { text: 'Voltar', role: 'cancel' },
        {
          text: 'Enviar Proposta',
          handler: (data) => {
            if (!data.new_date) return false;
            this.isLoading.set(true);
            this.serviceOrderService.proposeSchedule(this.orderId(), new Date(data.new_date).toISOString()).subscribe({
              next: (res: any) => {
                if (res.success) {
                  this.order.set(res.data);
                  this.showToast('Nova proposta de data enviada para a Central.');
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

  // Cancelar Chamado pelo Lojista/User
  async cancelOrder() {
    const alert = await this.alertCtrl.create({
      header: 'Cancelar Chamado ❌',
      message: 'Por favor, informe a justificativa para o cancelamento deste chamado:',
      inputs: [
        {
          name: 'reason',
          type: 'text',
          placeholder: 'Motivo do cancelamento'
        }
      ],
      buttons: [
        { text: 'Voltar', role: 'cancel' },
        {
          text: 'Confirmar Cancelamento',
          handler: (data) => {
            if (!data.reason) {
              this.showToast('Você precisa informar o motivo do cancelamento.');
              return false;
            }
            this.isLoading.set(true);
            this.serviceOrderService.cancelOrder(this.orderId(), data.reason).subscribe({
              next: (res: any) => {
                if (res.success) {
                  this.order.set(res.data);
                  this.showToast('Chamado cancelado com sucesso.');
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

  // Técnico: Relatar Problema no Trajeto (Linha do tempo fica vermelha temporariamente)
  async reportTransitIssue() {
    const alert = await this.alertCtrl.create({
      header: 'Relatar Problema no Trajeto ⚠️',
      message: 'Explique o motivo do atraso/imprevisto no trajeto (ex: Trânsito intenso, pneu furado):',
      inputs: [
        {
          name: 'reason',
          type: 'text',
          placeholder: 'Descreva o problema'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Relatar Problema',
          handler: (data) => {
            if (!data.reason) {
              this.showToast('Descreva o problema ocorrido.');
              return false;
            }
            this.isLoading.set(true);
            this.serviceOrderService.reportTransitIssue(this.orderId(), data.reason).subscribe({
              next: (res: any) => {
                if (res.success) {
                  this.order.set(res.data);
                  this.showToast('Problema no trajeto registrado com sucesso.');
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

  // Técnico: Resolver Problema no Trajeto (Volta a amarelo e continua)
  resolveTransitIssue() {
    this.isLoading.set(true);
    this.serviceOrderService.resolveTransitIssue(this.orderId()).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.order.set(res.data);
          this.showToast('Trajeto normalizado com sucesso.');
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  // Técnico: Relatar Impedimento na Execução (Física)
  async reportExecutionImpediment() {
    const alert = await this.alertCtrl.create({
      header: 'Relatar Impedimento Técnico ⚠️',
      message: 'Descreva o que está impedindo a realização do serviço no local:',
      inputs: [
        {
          name: 'reason',
          type: 'text',
          placeholder: 'Ex: Falta de energia, local trancado'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Relatar Impedimento',
          handler: (data) => {
            if (!data.reason) {
              this.showToast('Por favor, informe a justificativa.');
              return false;
            }
            this.isLoading.set(true);
            this.serviceOrderService.reportExecutionImpediment(this.orderId(), data.reason).subscribe({
              next: (res: any) => {
                if (res.success) {
                  this.order.set(res.data);
                  this.showToast('Impedimento físico relatado à Central.');
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

  // Técnico: Adicionar Aditivo (Serviço extra manual ou catálogo)
  async addAditive() {
    const inputs: any[] = this.catalogServices().map(serv => ({
      name: 'service_id',
      type: 'radio',
      label: serv.name,
      value: serv._id
    }));

    inputs.push({
      name: 'service_id',
      type: 'radio',
      label: 'Outro (Inserir manualmente)',
      value: 'manual'
    });

    const alert = await this.alertCtrl.create({
      header: 'Adicionar Serviço Aditivo',
      message: 'Selecione um serviço cadastrado no catálogo ou insira manualmente:',
      inputs: inputs,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Avançar',
          handler: async (selectedVal) => {
            if (!selectedVal) return;

            if (selectedVal === 'manual') {
              // Abre prompt manual
              const manualAlert = await this.alertCtrl.create({
                header: 'Descrição do Aditivo',
                inputs: [
                  {
                    name: 'description',
                    type: 'text',
                    placeholder: 'Descreva o serviço realizado'
                  }
                ],
                buttons: [
                  { text: 'Cancelar', role: 'cancel' },
                  {
                    text: 'Adicionar',
                    handler: (data) => {
                      if (!data.description) return false;
                      this.saveAditive({ description: data.description });
                      return true;
                    }
                  }
                ]
              });
              await manualAlert.present();
            } else {
              const selectedService = this.catalogServices().find(s => s._id === selectedVal);
              if (selectedService) {
                this.saveAditive({
                  description: selectedService.name,
                  service_id: selectedService._id
                });
              }
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private saveAditive(aditive: { description: string, service_id?: string }) {
    this.isLoading.set(true);
    this.serviceOrderService.addAditive(this.orderId(), aditive).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.order.set(res.data);
          this.showToast('Serviço aditivo adicionado com sucesso!');
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  // Lojista: Enviar assinatura e avaliação e finalizar OS
  submitEvaluation() {
    const existingSignature = this.order()?.follower_signature;
    const signature = (existingSignature && existingSignature.startsWith('data:image'))
      ? existingSignature
      : `Assinatura de ${this.order()?.company_id?.name || 'Cliente'}`;
    const stars = this.ratingStars();
    const comment = this.ratingComment();

    this.isLoading.set(true);
    this.serviceOrderService.evaluateOrder(this.orderId(), {
      follower_signature: signature,
      stars: stars > 0 ? stars : undefined,
      comment: comment || undefined
    }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.order.set(res.data);
          this.hasRated.set(true);
          this.showToast('Atendimento avaliado e concluído com sucesso!');
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  // Recusar Proposta pelo Lojista/User
  async rejectProposal() {
    const alert = await this.alertCtrl.create({
      header: 'Recusar Chamado / Proposta',
      message: 'Por favor, insira o motivo da recusa:',
      inputs: [
        {
          name: 'reason',
          type: 'text',
          placeholder: 'Motivo da recusa'
        }
      ],
      buttons: [
        { text: 'Voltar', role: 'cancel' },
        {
          text: 'Confirmar Recusa',
          handler: (data) => {
            if (!data.reason) {
              this.showToast('Por favor, informe o motivo da recusa.');
              return false;
            }
            this.isLoading.set(true);
            this.serviceOrderService.updateServiceOrder(this.orderId(), {
              current_status: 'RECUSADO',
              observations: `[Recusado] Motivo: ${data.reason}`
            }).subscribe({
              next: (res) => {
                if (res.success) {
                  this.order.set(res.data);
                  this.showToast('Proposta recusada com sucesso!');
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

  // Lojista: Reclamar / Contestar Serviço dentro de 30 minutos pós checkout
  async complainAboutService() {
    const alert = await this.alertCtrl.create({
      header: 'Reclamar do Serviço ⚠️',
      message: 'Por favor, descreva qual problema ou insatisfação ocorreu com o serviço realizado:',
      inputs: [
        {
          name: 'reason',
          type: 'text',
          placeholder: 'Descreva o problema/motivo da contestação'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar Contestação',
          handler: (data) => {
            if (!data.reason) {
              this.showToast('Por favor, descreva o problema.');
              return false;
            }
            this.isLoading.set(true);
            this.serviceOrderService.updateServiceOrder(this.orderId(), {
              current_status: 'RECUSADO',
              observations: `[Contestação do Lojista] Motivo: ${data.reason}`
            }).subscribe({
              next: (res: any) => {
                if (res.success) {
                  this.order.set(res.data);
                  this.showToast('Contestação enviada com sucesso. A OS retornará sob análise.');
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
    const sequence = [
      'SOLICITADO', 
      'APROVADO', 
      'AGENDADO', 
      'EM_DESLOCAMENTO', 
      'CHECK_IN', 
      'EM_EXECUCAO', 
      'RELATORIO_CHECKOUT', 
      'AVALIACAO', 
      'CONCLUIDO'
    ];
    const currentStatus = this.order()?.current_status;
    if (!currentStatus || currentStatus === 'CANCELADO' || currentStatus === 'RECUSADO') return false;
    
    const currentIndex = sequence.indexOf(currentStatus);
    const checkIndex = sequence.indexOf(status);
    
    if (currentIndex === -1 || checkIndex === -1) return false;
    
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
