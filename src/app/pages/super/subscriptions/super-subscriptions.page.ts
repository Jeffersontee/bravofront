import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ActionSheetController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  searchOutline, refreshOutline, receiptOutline,
  chevronForward, checkmarkCircleOutline, alertCircleOutline,
  timeOutline, swapHorizontalOutline, businessOutline
} from 'ionicons/icons';
import { PlanService, Subscription, Plan } from 'src/app/services/plan/plan.service';
import { CompanyService, Company } from 'src/app/services/company/company.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-super-subscriptions',
  templateUrl: './super-subscriptions.page.html',
  styleUrls: ['./super-subscriptions.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class SuperSubscriptionsPage implements OnInit {
  private planService = inject(PlanService);
  private companyService = inject(CompanyService);
  private global = inject(GlobalService);
  private actionSheetCtrl = inject(ActionSheetController);
  private alertCtrl = inject(AlertController);

  public isLoading = signal(true);
  public subscriptions = signal<any[]>([]);
  public plans = signal<Plan[]>([]);
  public searchTerm = signal('');
  public selectedTab = signal<'ALL' | 'ACTIVE' | 'PENDING'>('ALL');

  public filteredSubscriptions = computed(() => {
    let list = this.subscriptions();
    const tab = this.selectedTab();
    const search = this.searchTerm().trim().toLowerCase();

    // Filtro por aba
    if (tab === 'ACTIVE') {
      list = list.filter(s => s.status === 'active' || s.status === 'trialing');
    } else if (tab === 'PENDING') {
      list = list.filter(s => s.status === 'past_due' || s.status === 'unpaid' || s.status === 'pending');
    }

    // Filtro por busca
    if (search) {
      list = list.filter(s => {
        const compName = (s.company_name || s.company_id?.name || '').toLowerCase();
        const planName = (s.plan_name || s.plan_id?.name || '').toLowerCase();
        return compName.includes(search) || planName.includes(search);
      });
    }

    return list;
  });

  constructor() {
    addIcons({
      searchOutline, refreshOutline, receiptOutline,
      chevronForward, checkmarkCircleOutline, alertCircleOutline,
      timeOutline, swapHorizontalOutline, businessOutline
    });
  }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.isLoading.set(true);
    try {
      const [subsRes, plansRes] = await Promise.all([
        this.planService.getSubscriptions().toPromise(),
        this.planService.getPlans().toPromise()
      ]);

      if (subsRes?.data) {
        this.subscriptions.set(subsRes.data);
      }
      if (plansRes?.data) {
        this.plans.set(plansRes.data);
      }
    } catch (e) {
      console.error('Erro ao carregar assinaturas:', e);
      this.global.errorToast('Não foi possível carregar as assinaturas.');
    } finally {
      this.isLoading.set(false);
    }
  }

  onTabChange(tab: any) {
    this.selectedTab.set(tab);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'badge--active';
      case 'past_due':
      case 'unpaid':
      case 'pending':
        return 'badge--pending';
      default:
        return 'badge--canceled';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'active';
      case 'trialing': return 'trial';
      case 'past_due': return 'atrasado';
      case 'canceled': return 'cancelado';
      default: return status || 'active';
    }
  }

  getCompanyName(sub: any): string {
    return sub.company_name || sub.company_id?.name || 'Adega / Empresa';
  }

  getPlanName(sub: any): string {
    return sub.plan_name || sub.plan_id?.name || 'Trial';
  }

  getAmount(sub: any): number {
    return sub.amount !== undefined ? sub.amount : (sub.plan_id?.price || 0);
  }

  async openSubscriptionActions(sub: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: `${this.getCompanyName(sub)} - ${this.getPlanName(sub)}`,
      buttons: [
        {
          text: 'Alterar Plano',
          icon: 'swap-horizontal-outline',
          handler: () => this.promptChangePlan(sub)
        },
        {
          text: 'Fechar',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async promptChangePlan(sub: any) {
    const inputs = this.plans().map(p => ({
      type: 'radio' as const,
      label: `${p.name} - R$ ${p.price}/mês`,
      value: p._id,
      checked: p.name === this.getPlanName(sub)
    }));

    const alert = await this.alertCtrl.create({
      header: 'Selecione o Novo Plano',
      inputs,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: (newPlanId) => {
            if (newPlanId) {
              this.global.showLoader();
              this.planService.updatePlan(sub.id || sub._id, { _id: newPlanId }).subscribe({
                next: () => {
                  this.global.hideLoader();
                  this.global.successToast('Plano atualizado com sucesso!');
                  this.loadData();
                },
                error: (err) => {
                  this.global.hideLoader();
                  console.error('Erro ao atualizar plano:', err);
                  this.global.errorToast('Erro ao atualizar o plano.');
                }
              });
            }
          }
        }
      ]
    });
    await alert.present();
  }
}
