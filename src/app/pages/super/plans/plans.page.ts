import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, IonButton,
  IonIcon, IonContent, IonSpinner, IonGrid, IonRow, IonCol, IonCard,
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonBadge, IonCardContent,
  IonLabel, IonList, IonItem, IonFab, IonFabButton, IonText, IonSkeletonText,
  IonChip, AlertController, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  refreshOutline, cashOutline, peopleOutline, checkmarkCircleOutline,
  addOutline, createOutline, trashOutline, businessOutline, constructOutline,
  layersOutline, alertCircleOutline, checkmarkOutline, closeOutline,
  pricetagsOutline, shieldCheckmarkOutline, repeatOutline, eyeOutline
} from 'ionicons/icons';
import { PlanService, Plan } from 'src/app/services/plan/plan.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { PlansFormComponent } from 'src/app/components/plans-form/plans-form.component';

@Component({
  selector: 'app-super-plans',
  templateUrl: './plans.page.html',
  styleUrls: ['./plans.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonIcon,
    IonContent,
    IonSpinner,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonBadge,
    IonCardContent,
    IonLabel,
    IonList,
    IonItem,
    IonFab,
    IonFabButton,
    IonText,
    IonSkeletonText,
    IonChip
  ]
})
export class PlansPage implements OnInit {
  private planService = inject(PlanService);
  private global = inject(GlobalService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private router = inject(Router);

  public plans = signal<Plan[]>([]);
  public isLoading = signal<boolean>(true);

  public totalSubscribers = computed(() =>
    this.plans().reduce((acc, p) => acc + (p.total_subscribers || 0), 0)
  );

  public totalMRR = computed(() =>
    this.plans().reduce((acc, p) => acc + ((p.total_subscribers || 0) * (p.price || 0)), 0)
  );

  public activePlansCount = computed(() =>
    this.plans().filter(p => p.status === 'active').length
  );

  constructor() {
    addIcons({
      refreshOutline,
      cashOutline,
      peopleOutline,
      checkmarkCircleOutline,
      addOutline,
      createOutline,
      trashOutline,
      businessOutline,
      constructOutline,
      layersOutline,
      alertCircleOutline,
      checkmarkOutline,
      closeOutline,
      pricetagsOutline,
      shieldCheckmarkOutline,
      repeatOutline,
      eyeOutline
    });
  }

  async ngOnInit() {
    await this.loadPlans();
  }

  async loadPlans() {
    this.isLoading.set(true);
    try {
      const res = await this.planService.getPlans().toPromise();
      if (res?.data) {
        this.plans.set(res.data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar planos:', error);
      this.global.errorToast('Erro ao carregar catálogo de planos.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onCreatePlan() {
    const modal = await this.modalCtrl.create({
      component: PlansFormComponent
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      await this.savePlan(data);
    }
  }

  async onEditPlan(plan: Plan) {
    const modal = await this.modalCtrl.create({
      component: PlansFormComponent,
      componentProps: { planInput: plan }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      await this.savePlan(data);
    }
  }

  private async savePlan(planData: Partial<Plan>) {
    try {
      this.global.showLoader();
      if (planData._id) {
        await this.planService.updatePlan(planData._id, planData).toPromise();
        this.global.successToast('Plano SaaS atualizado com sucesso!');
      } else {
        await this.planService.createPlan(planData).toPromise();
        this.global.successToast('Novo Plano SaaS criado com sucesso!');
      }
      await this.loadPlans();
    } catch (error: any) {
      console.error('Erro ao salvar plano:', error);
      this.global.errorToast(error?.error?.message || 'Erro ao salvar o plano.');
    } finally {
      this.global.hideLoader();
    }
  }

  async onDeletePlan(plan: Plan) {
    if (!plan._id) return;

    const alert = await this.alertCtrl.create({
      header: 'Excluir Plano SaaS',
      message: `Tem certeza que deseja remover o plano "${plan.name}"? Esta ação não pode ser desfeita.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            try {
              this.global.showLoader();
              await this.planService.deletePlan(plan._id!).toPromise();
              this.global.successToast('Plano removido com sucesso!');
              await this.loadPlans();
            } catch (error: any) {
              console.error('Erro ao excluir plano:', error);
              this.global.errorToast(error?.error?.message || 'Não é possível remover um plano com assinaturas vinculadas.');
            } finally {
              this.global.hideLoader();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getBillingCycleLabel(cycle?: string): string {
    switch (cycle) {
      case 'quarterly': return 'Trimestral';
      case 'semiannual': return 'Semestral';
      case 'yearly': return 'Anual';
      case 'monthly':
      default:
        return 'Mensal';
    }
  }

  onViewSubscribers(plan: Plan) {
    this.router.navigate(['/super-admin/subscriptions'], {
      queryParams: { plan_id: plan._id }
    });
  }
}
