import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardSubtitle, IonCardContent, IonBadge, IonButton, 
  IonIcon, IonSpinner, IonGrid, IonRow, IonCol, IonItem, IonLabel,
  IonList, IonNote, IonProgressBar, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  ribbonOutline, checkmarkCircleOutline, starOutline, 
  calendarOutline, cashOutline, speedometerOutline, refreshOutline,
  businessOutline, layersOutline, peopleOutline, alertCircleOutline,
  sparklesOutline, shieldCheckmarkOutline, arrowForwardOutline
} from 'ionicons/icons';
import { PlanService, Plan, Subscription } from 'src/app/services/plan/plan.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { CompanyService } from 'src/app/services/company/company.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-company-subscriptions',
  templateUrl: './subscriptions.page.html',
  styleUrls: ['./subscriptions.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
    IonCardTitle, IonCardSubtitle, IonCardContent, IonBadge, IonButton, 
    IonIcon, IonSpinner, IonGrid, IonRow, IonCol, IonItem, IonLabel,
    IonList, IonNote, IonProgressBar
  ]
})
export class SubscriptionsPage implements OnInit {
  private planService = inject(PlanService);
  private profileService = inject(ProfileService);
  private companyService = inject(CompanyService);
  private global = inject(GlobalService);
  private alertCtrl = inject(AlertController);
  private router = inject(Router);

  public isLoading = signal(true);
  public currentSubscription = signal<any | null>(null);
  public company = signal<any | null>(null);
  public activePlan = signal<Plan | null>(null);
  public availablePlans = signal<Plan[]>([]);
  public catalogServicesCount = signal(0);

  constructor() {
    addIcons({
      ribbonOutline, checkmarkCircleOutline, starOutline, 
      calendarOutline, cashOutline, speedometerOutline, refreshOutline,
      businessOutline, layersOutline, peopleOutline, alertCircleOutline,
      sparklesOutline, shieldCheckmarkOutline, arrowForwardOutline
    });
  }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.isLoading.set(true);
    try {
      const user = await this.profileService.getProfile();
      const isSuper = user?.type === 'super_admin';
      if (!isSuper) {
        const permissions = user?.permissions || [];
        if (!permissions.includes('COMPANY_FINANCIAL_PANEL')) {
          this.global.errorToast('Acesso Restrito: Você precisa de liberação para acessar o módulo Financeiro.');
          this.router.navigate(['/company/profile'], { replaceUrl: true });
          this.isLoading.set(false);
          return;
        }
      }
      if (user && user.company_id) {
        const compRes = await this.companyService.getCompanyById(user.company_id).toPromise();
        if (compRes?.data) {
          this.company.set(compRes.data);
          this.catalogServicesCount.set((compRes.data.services || []).length);
        }

        // Subscriptions
        const subsRes = await this.planService.getSubscriptions({ company_id: user.company_id }).toPromise();
        if (subsRes?.data && subsRes.data.length > 0) {
          this.currentSubscription.set(subsRes.data[0]);
        }

        // Plans
        const plansRes = await this.planService.getPlans().toPromise();
        if (plansRes?.data) {
          this.availablePlans.set(plansRes.data);
          if (compRes?.data?.plan_id) {
            const planId = typeof compRes.data.plan_id === 'object' ? compRes.data.plan_id._id : compRes.data.plan_id;
            const found = plansRes.data.find(p => p._id === planId);
            if (found) {
              this.activePlan.set(found);
            }
          }
        }
      }
    } catch (e: any) {
      console.error('Erro ao carregar dados da assinatura:', e);
      this.global.errorToast('Não foi possível carregar os dados do plano.');
    } finally {
      this.isLoading.set(false);
    }
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'active': return 'badge--active';
      case 'trialing': return 'badge--trial';
      case 'past_due': return 'badge--warning';
      case 'canceled': return 'badge--danger';
      default: return 'badge--default';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'active': return 'Assinatura Ativa';
      case 'trialing': return 'Período de Avaliação (Trial)';
      case 'past_due': return 'Pagamento Pendente';
      case 'canceled': return 'Cancelada';
      default: return 'Ativo';
    }
  }

  getBillingCycleLabel(cycle?: string): string {
    switch (cycle) {
      case 'monthly': return 'mensal';
      case 'quarterly': return 'trimestral';
      case 'semiannual': return 'semestral';
      case 'yearly': return 'anual';
      default: return 'mensal';
    }
  }

  getServicesProgress(): number {
    const max = this.activePlan()?.max_services || 10;
    const current = this.catalogServicesCount();
    return Math.min(current / max, 1);
  }

  async onSelectPlan(plan: Plan) {
    const alert = await this.alertCtrl.create({
      header: 'Alteração de Plano',
      subHeader: `Migrar para o plano ${plan.name}`,
      message: `Deseja solicitar a migração para o plano ${plan.name} no valor de R$ ${plan.price.toFixed(2)} / mês?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar Migração',
          handler: () => {
            this.executePlanChange(plan);
          }
        }
      ]
    });
    await alert.present();
  }

  private executePlanChange(plan: Plan) {
    const comp = this.company();
    if (!comp?._id || !plan._id) return;

    this.isLoading.set(true);
    this.companyService.updateCompany(comp._id, { plan_id: plan._id }).subscribe({
      next: () => {
        this.global.successToast(`Plano atualizado com sucesso para ${plan.name}!`);
        this.loadData();
      },
      error: (err: any) => {
        console.error(err);
        this.global.errorToast(err.error?.message || 'Erro ao alterar o plano.');
        this.isLoading.set(false);
      }
    });
  }
}
