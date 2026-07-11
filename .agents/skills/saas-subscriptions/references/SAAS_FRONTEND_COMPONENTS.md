# 🎨 Frontend SaaS - Componentes e Páginas

## 📋 Componentes de Subscription

### **1. Seletor de Planos**

```typescript
// components/plan-selector/plan-selector.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { Plan } from '../../models/plan.model';
import { PlanService } from '../../services/plan/plan.service';

@Component({
  selector: 'app-plan-selector',
  templateUrl: './plan-selector.component.html',
  styleUrls: ['./plan-selector.component.scss'],
})
export class PlanSelectorComponent {
  @Output() planSelected = new EventEmitter<Plan>();

  plans: Plan[] = [];
  selectedPlan: Plan | null = null;
  billingCycle: 'monthly' | 'annual' = 'monthly';

  constructor(private planService: PlanService) {
    this.loadPlans();
  }

  async loadPlans() {
    try {
      this.plans = await this.planService.getActivePlans().toPromise();
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  }

  selectPlan(plan: Plan) {
    this.selectedPlan = plan;
    this.planSelected.emit(plan);
  }

  getPlanPrice(plan: Plan): number {
    return this.billingCycle === 'annual' ? plan.price_annual : plan.price_monthly;
  }

  getSavings(plan: Plan): number {
    if (this.billingCycle !== 'annual') return 0;
    const monthlyTotal = plan.price_monthly * 12;
    return monthlyTotal - plan.price_annual;
  }

  toggleBillingCycle() {
    this.billingCycle = this.billingCycle === 'monthly' ? 'annual' : 'monthly';
  }
}
```

```html
<!-- plan-selector.component.html -->
<ion-card *ngFor="let plan of plans" [class.selected]="selectedPlan?._id === plan._id"
          (click)="selectPlan(plan)">

  <!-- Badge Popular -->
  <ion-badge *ngIf="plan.is_popular" color="primary" class="popular-badge">
    Mais Popular
  </ion-badge>

  <ion-card-header>
    <ion-card-title>{{ plan.name }}</ion-card-title>
    <div class="price-container">
      <span class="currency">R$</span>
      <span class="price">{{ getPlanPrice(plan) }}</span>
      <span class="period">/{{ billingCycle === 'monthly' ? 'mês' : 'ano' }}</span>
    </div>

    <!-- Economia Anual -->
    <div *ngIf="billingCycle === 'annual' && getSavings(plan) > 0" class="savings">
      Economize R$ {{ getSavings(plan) }}
    </div>
  </ion-card-header>

  <ion-card-content>
    <p class="description">{{ plan.description }}</p>

    <!-- Features -->
    <ion-list>
      <ion-item *ngFor="let feature of getPlanFeatures(plan)">
        <ion-icon name="checkmark-circle" color="success" slot="start"></ion-icon>
        <ion-label>{{ feature }}</ion-label>
      </ion-item>
    </ion-list>

    <!-- Trial -->
    <ion-badge *ngIf="plan.trial_days" color="success" class="trial-badge">
      {{ plan.trial_days }} dias grátis
    </ion-badge>
  </ion-card-content>
</ion-card>

<!-- Toggle Anual/Mensal -->
<ion-row class="billing-toggle">
  <ion-col size="6">
    <span [class.active]="billingCycle === 'monthly'">Mensal</span>
  </ion-col>
  <ion-col size="6">
    <span [class.active]="billingCycle === 'annual'">Anual</span>
    <small *ngIf="billingCycle === 'annual'" class="discount">2 meses grátis</small>
  </ion-col>
  <ion-col size="12">
    <ion-range min="0" max="1" [value]="billingCycle === 'annual' ? 1 : 0"
               (ionChange)="toggleBillingCycle()"></ion-range>
  </ion-col>
</ion-row>
```

### **2. Status da Subscription**

```typescript
// components/subscription-status/subscription-status.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from '../../models/subscription.model';
import { Plan } from '../../models/plan.model';

@Component({
  selector: 'app-subscription-status',
  templateUrl: './subscription-status.component.html',
  styleUrls: ['./subscription-status.component.scss'],
})
export class SubscriptionStatusComponent implements OnInit {
  @Input() subscription: Subscription;
  @Input() plan: Plan;

  daysUntilRenewal: number;
  isExpiringSoon: boolean;

  ngOnInit() {
    this.calculateDaysUntilRenewal();
  }

  private calculateDaysUntilRenewal() {
    if (!this.subscription?.next_billing_date) return;

    const now = new Date();
    const renewal = new Date(this.subscription.next_billing_date);
    const diffTime = renewal.getTime() - now.getTime();
    this.daysUntilRenewal = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.isExpiringSoon = this.daysUntilRenewal <= 7;
  }

  getStatusColor(): string {
    const statusColors = {
      'active': 'success',
      'trial': 'warning',
      'past_due': 'danger',
      'suspended': 'danger',
      'cancelled': 'medium'
    };
    return statusColors[this.subscription?.status] || 'primary';
  }

  getStatusText(): string {
    const statusTexts = {
      'active': 'Ativa',
      'trial': 'Período de Teste',
      'past_due': 'Pagamento Pendente',
      'suspended': 'Suspensa',
      'cancelled': 'Cancelada'
    };
    return statusTexts[this.subscription?.status] || 'Desconhecido';
  }

  canCancel(): boolean {
    return ['active', 'trial'].includes(this.subscription?.status);
  }

  canReactivate(): boolean {
    return this.subscription?.status === 'cancelled';
  }
}
```

```html
<!-- subscription-status.component.html -->
<ion-card [color]="getStatusColor()">
  <ion-card-header>
    <ion-card-title>
      <ion-icon [name]="getStatusIcon()" slot="start"></ion-icon>
      {{ getStatusText() }}
    </ion-card-title>
    <ion-card-subtitle>{{ plan?.name }}</ion-card-subtitle>
  </ion-card-header>

  <ion-card-content>
    <!-- Próxima Cobrança -->
    <div *ngIf="subscription?.status === 'active'" class="renewal-info">
      <ion-icon name="calendar-outline"></ion-icon>
      <span>Próxima cobrança em {{ daysUntilRenewal }} dias</span>
      <ion-badge *ngIf="isExpiringSoon" color="warning">Em breve</ion-badge>
    </div>

    <!-- Trial -->
    <div *ngIf="subscription?.status === 'trial'" class="trial-info">
      <ion-icon name="time-outline"></ion-icon>
      <span>{{ daysUntilRenewal }} dias restantes de teste</span>
    </div>

    <!-- Pagamento Pendente -->
    <div *ngIf="subscription?.status === 'past_due'" class="past-due-warning">
      <ion-icon name="warning-outline" color="danger"></ion-icon>
      <span>Pagamento pendente - R$ {{ subscription?.amount }}</span>
    </div>

    <!-- Valor -->
    <div class="amount-info">
      <strong>R$ {{ subscription?.amount }}/mês</strong>
    </div>

    <!-- Ações -->
    <ion-row class="action-buttons">
      <ion-col *ngIf="canCancel()">
        <ion-button fill="outline" color="danger" size="small" (click)="cancelSubscription()">
          Cancelar
        </ion-button>
      </ion-col>
      <ion-col *ngIf="canReactivate()">
        <ion-button fill="solid" color="success" size="small" (click)="reactivateSubscription()">
          Reativar
        </ion-button>
      </ion-col>
      <ion-col>
        <ion-button fill="outline" size="small" (click)="changePlan()">
          Alterar Plano
        </ion-button>
      </ion-col>
    </ion-row>
  </ion-card-content>
</ion-card>
```

## 📄 Páginas SaaS

### **1. Página de Checkout**

```typescript
// pages/checkout/checkout.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, AlertController } from '@ionic/angular';
import { Plan } from '../../models/plan.model';
import { PlanService } from '../../services/plan/plan.service';
import { SubscriptionCheckoutComponent } from '../../components/subscription-checkout/subscription-checkout.component';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {
  plan: Plan;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planService: PlanService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadPlan();
  }

  async loadPlan() {
    try {
      const planId = this.route.snapshot.paramMap.get('planId');
      if (!planId) {
        this.router.navigate(['/plans']);
        return;
      }

      this.plan = await this.planService.getPlan(planId).toPromise();
    } catch (error) {
      console.error('Erro ao carregar plano:', error);
      this.showError('Plano não encontrado');
    } finally {
      this.loading = false;
    }
  }

  async proceedToCheckout() {
    const modal = await this.modalCtrl.create({
      component: SubscriptionCheckoutComponent,
      componentProps: {
        plan: this.plan
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.success) {
        this.showSuccess();
      }
    });

    await modal.present();
  }

  private async showSuccess() {
    const alert = await this.alertCtrl.create({
      header: 'Assinatura Criada!',
      message: 'Sua assinatura foi criada com sucesso. Você será redirecionado para o dashboard.',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.router.navigate(['/dashboard']);
        }
      }]
    });
    await alert.present();
  }

  private async showError(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Erro',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
```

```html
<!-- checkout.page.html -->
<ion-header>
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-back-button defaultHref="/plans"></ion-back-button>
    </ion-buttons>
    <ion-title>Checkout</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <div *ngIf="loading" class="loading-container">
    <ion-spinner></ion-spinner>
    <p>Carregando plano...</p>
  </div>

  <div *ngIf="!loading && plan">
    <!-- Resumo do Plano -->
    <ion-card class="plan-summary">
      <ion-card-header>
        <ion-card-title>{{ plan.name }}</ion-card-title>
        <ion-card-subtitle>{{ plan.description }}</ion-card-subtitle>
      </ion-card-header>

      <ion-card-content>
        <div class="price-display">
          <span class="currency">R$</span>
          <span class="price">{{ plan.price_monthly }}</span>
          <span class="period">/mês</span>
        </div>

        <div *ngIf="plan.trial_days" class="trial-notice">
          <ion-icon name="gift-outline"></ion-icon>
          <span>{{ plan.trial_days }} dias grátis incluídos</span>
        </div>

        <!-- Features -->
        <ion-list class="features-list">
          <ion-item *ngFor="let feature of getPlanFeatures()">
            <ion-icon name="checkmark-circle" color="success" slot="start"></ion-icon>
            <ion-label>{{ feature }}</ion-label>
          </ion-item>
        </ion-list>
      </ion-card-content>
    </ion-card>

    <!-- Botão de Checkout -->
    <ion-button
      expand="block"
      size="large"
      class="checkout-button"
      (click)="proceedToCheckout()">
      <ion-icon name="card-outline" slot="start"></ion-icon>
      Assinar {{ plan.name }}
    </ion-button>

    <!-- Termos -->
    <ion-text class="terms-text">
      <p>
        Ao continuar, você concorda com nossos
        <a href="#" target="_blank">Termos de Serviço</a> e
        <a href="#" target="_blank">Política de Privacidade</a>.
        Você pode cancelar a qualquer momento.
      </p>
    </ion-text>
  </div>
</ion-content>
```

### **2. Dashboard do Estabelecimento**

```typescript
// pages/dashboard/dashboard.page.ts
import { Component, OnInit } from '@angular/core';
import { Subscription } from '../../models/subscription.model';
import { Plan } from '../../models/plan.model';
import { SubscriptionService } from '../../services/subscription/subscription.service';
import { PlanService } from '../../services/plan/plan.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  subscription: Subscription;
  plan: Plan;
  loading = true;

  // Métricas de uso
  usageStats = {
    itemsUsed: 0,
    itemsLimit: 0,
    usersUsed: 0,
    usersLimit: 0,
    storageUsed: 0,
    storageLimit: 0
  };

  constructor(
    private subscriptionService: SubscriptionService,
    private planService: PlanService
  ) {}

  ngOnInit() {
    this.loadSubscriptionData();
    this.loadUsageStats();
  }

  async loadSubscriptionData() {
    try {
      const result = await this.subscriptionService.getCurrentSubscription().toPromise();
      this.subscription = result.subscription;
      this.plan = result.plan;
    } catch (error) {
      console.error('Erro ao carregar subscription:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadUsageStats() {
    try {
      // Implementar endpoint para buscar estatísticas de uso
      const stats = await this.subscriptionService.getUsageStats().toPromise();
      this.usageStats = stats;
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }

  getUsagePercentage(used: number, limit: number): number {
    if (limit === 0 || limit === -1) return 0; // Ilimitado
    return Math.round((used / limit) * 100);
  }

  isNearLimit(used: number, limit: number): boolean {
    const percentage = this.getUsagePercentage(used, limit);
    return percentage >= 80;
  }

  getLimitText(limit: number): string {
    return limit === -1 ? 'Ilimitado' : limit.toString();
  }

  async upgradePlan() {
    // Navegar para página de planos
    // this.router.navigate(['/plans']);
  }
}
```

```html
<!-- dashboard.page.html -->
<ion-header>
  <ion-toolbar>
    <ion-title>Dashboard</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <div *ngIf="loading" class="loading-container">
    <ion-spinner></ion-spinner>
  </div>

  <div *ngIf="!loading">
    <!-- Status da Subscription -->
    <app-subscription-status
      [subscription]="subscription"
      [plan]="plan"
      (onCancel)="handleCancelSubscription()"
      (onChangePlan)="handleChangePlan()">
    </app-subscription-status>

    <!-- Estatísticas de Uso -->
    <ion-card>
      <ion-card-header>
        <ion-card-title>Uso do Plano</ion-card-title>
      </ion-card-header>

      <ion-card-content>
        <!-- Itens -->
        <div class="usage-item">
          <div class="usage-label">
            <ion-icon name="restaurant-outline"></ion-icon>
            <span>Itens do Cardápio</span>
          </div>
          <div class="usage-bar">
            <ion-progress-bar
              [value]="getUsagePercentage(usageStats.itemsUsed, usageStats.itemsLimit) / 100"
              [color]="isNearLimit(usageStats.itemsUsed, usageStats.itemsLimit) ? 'warning' : 'primary'">
            </ion-progress-bar>
          </div>
          <div class="usage-text">
            {{ usageStats.itemsUsed }} / {{ getLimitText(usageStats.itemsLimit) }}
          </div>
        </div>

        <!-- Usuários -->
        <div class="usage-item">
          <div class="usage-label">
            <ion-icon name="people-outline"></ion-icon>
            <span>Usuários</span>
          </div>
          <div class="usage-bar">
            <ion-progress-bar
              [value]="getUsagePercentage(usageStats.usersUsed, usageStats.usersLimit) / 100"
              [color]="isNearLimit(usageStats.usersUsed, usageStats.usersLimit) ? 'warning' : 'primary'">
            </ion-progress-bar>
          </div>
          <div class="usage-text">
            {{ usageStats.usersUsed }} / {{ getLimitText(usageStats.usersLimit) }}
          </div>
        </div>

        <!-- Armazenamento -->
        <div class="usage-item">
          <div class="usage-label">
            <ion-icon name="cloud-outline"></ion-icon>
            <span>Armazenamento</span>
          </div>
          <div class="usage-bar">
            <ion-progress-bar
              [value]="getUsagePercentage(usageStats.storageUsed, usageStats.storageLimit) / 100"
              [color]="isNearLimit(usageStats.storageUsed, usageStats.storageLimit) ? 'warning' : 'primary'">
            </ion-progress-bar>
          </div>
          <div class="usage-text">
            {{ usageStats.storageUsed }}GB / {{ getLimitText(usageStats.storageLimit) }}GB
          </div>
        </div>

        <!-- Upgrade Button -->
        <ion-button
          *ngIf="isNearLimit(usageStats.itemsUsed, usageStats.itemsLimit) ||
                 isNearLimit(usageStats.usersUsed, usageStats.usersLimit) ||
                 isNearLimit(usageStats.storageUsed, usageStats.storageLimit)"
          expand="block"
          fill="outline"
          class="upgrade-button"
          (click)="upgradePlan()">
          <ion-icon name="arrow-up-circle-outline" slot="start"></ion-icon>
          Fazer Upgrade
        </ion-button>
      </ion-card-content>
    </ion-card>

    <!-- Ações Rápidas -->
    <ion-card>
      <ion-card-header>
        <ion-card-title>Ações Rápidas</ion-card-title>
      </ion-card-header>

      <ion-card-content>
        <ion-row>
          <ion-col size="6">
            <ion-button fill="outline" expand="block">
              <ion-icon name="card-outline" slot="start"></ion-icon>
              <ion-label>Ver Faturas</ion-label>
            </ion-button>
          </ion-col>
          <ion-col size="6">
            <ion-button fill="outline" expand="block">
              <ion-icon name="settings-outline" slot="start"></ion-icon>
              <ion-label>Configurações</ion-label>
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-card-content>
    </ion-card>
  </div>
</ion-content>
```

## 🎨 Estilos SCSS

### **1. Plan Selector Styles**

```scss
// plan-selector.component.scss
ion-card {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.selected {
    border: 2px solid var(--ion-color-primary);
    box-shadow: 0 0 0 2px var(--ion-color-primary);
  }
}

.popular-badge {
  position: absolute;
  top: -10px;
  right: 16px;
  z-index: 1;
}

.price-container {
  display: flex;
  align-items: baseline;
  margin: 8px 0;

  .currency {
    font-size: 1.2em;
    margin-right: 4px;
  }

  .price {
    font-size: 2.5em;
    font-weight: bold;
    color: var(--ion-color-primary);
  }

  .period {
    font-size: 1em;
    color: var(--ion-color-medium);
    margin-left: 4px;
  }
}

.savings {
  background: var(--ion-color-success);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  margin-top: 8px;
  display: inline-block;
}

.trial-badge {
  margin-top: 12px;
}

.billing-toggle {
  margin: 20px 0;
  text-align: center;

  span {
    font-weight: 500;
    transition: color 0.3s ease;

    &.active {
      color: var(--ion-color-primary);
    }
  }

  .discount {
    color: var(--ion-color-success);
    font-weight: bold;
  }
}
```

### **2. Subscription Status Styles**

```scss
// subscription-status.component.scss
ion-card {
  &[color="success"] {
    --background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
  }

  &[color="warning"] {
    --background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
  }

  &[color="danger"] {
    --background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  }
}

.renewal-info, .trial-info, .past-due-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;

  ion-icon {
    font-size: 1.2em;
  }
}

.amount-info {
  text-align: center;
  margin: 16px 0;

  strong {
    font-size: 1.4em;
    color: var(--ion-color-primary);
  }
}

.action-buttons {
  margin-top: 16px;

  ion-button {
    --border-radius: 6px;
  }
}
```

### **3. Dashboard Styles**

```scss
// dashboard.page.scss
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;

  ion-spinner {
    margin-bottom: 16px;
  }
}

.usage-item {
  margin: 16px 0;

  .usage-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-weight: 500;

    ion-icon {
      color: var(--ion-color-primary);
    }
  }

  .usage-bar {
    margin-bottom: 8px;
  }

  .usage-text {
    text-align: right;
    font-size: 0.9em;
    color: var(--ion-color-medium);
  }
}

.upgrade-button {
  margin-top: 16px;
  --border-radius: 8px;

  ion-icon {
    margin-right: 8px;
  }
}

.plan-summary {
  margin-bottom: 24px;

  .price-display {
    text-align: center;
    margin: 16px 0;

    .currency {
      font-size: 1.2em;
      vertical-align: top;
    }

    .price {
      font-size: 3em;
      font-weight: bold;
      color: var(--ion-color-primary);
    }

    .period {
      font-size: 1.2em;
      color: var(--ion-color-medium);
    }
  }

  .trial-notice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--ion-color-success);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    margin: 16px 0;
    font-weight: 500;
  }

  .features-list {
    margin-top: 16px;

    ion-item {
      --padding-start: 0;
      --inner-padding-end: 0;
      --border-radius: 8px;
      margin-bottom: 8px;
    }
  }
}

.checkout-button {
  margin: 24px 16px;
  --border-radius: 12px;
  height: 56px;

  ion-icon {
    margin-right: 8px;
  }
}

.terms-text {
  text-align: center;
  margin: 16px;
  color: var(--ion-color-medium);

  a {
    color: var(--ion-color-primary);
    text-decoration: underline;
  }
}
```

## 🔧 Serviços Adicionais

### **1. Serviço de Analytics SaaS**

```typescript
// services/analytics/analytics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly API_URL = `${environment.serverUrl}/analytics`;

  constructor(private http: HttpClient) {}

  // Dashboard Super Admin
  getSaaSMetrics() {
    return this.http.get(`${this.API_URL}/saas-metrics`);
  }

  getRevenueMetrics() {
    return this.http.get(`${this.API_URL}/revenue`);
  }

  getChurnAnalysis() {
    return this.http.get(`${this.API_URL}/churn`);
  }

  // Dashboard Estabelecimento
  getUsageStats() {
    return this.http.get(`${this.API_URL}/usage`);
  }

  getBillingHistory() {
    return this.http.get(`${this.API_URL}/billing-history`);
  }

  // Relatórios
  getPlanPerformance() {
    return this.http.get(`${this.API_URL}/plan-performance`);
  }

  getCustomerLifetimeValue() {
    return this.http.get(`${this.API_URL}/ltv`);
  }
}
```

### **2. Guards de Plano**

```typescript
// guards/plan-limits.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SubscriptionService } from '../services/subscription/subscription.service';
import { PlanService } from '../services/plan/plan.service';

@Injectable({
  providedIn: 'root'
})
export class PlanLimitsGuard implements CanActivate {
  constructor(
    private subscriptionService: SubscriptionService,
    private planService: PlanService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    try {
      const subscription = await this.subscriptionService.getCurrentSubscription().toPromise();
      const plan = await this.planService.getPlan(subscription.plan_id).toPromise();

      // Verificar limites
      if (this.hasExceededLimits(plan)) {
        // Redirecionar para upgrade
        this.router.navigate(['/upgrade'], {
          queryParams: {
            reason: 'limit_exceeded',
            feature: this.getExceededFeature(plan)
          }
        });
        return false;
      }

      return true;
    } catch (error) {
      this.router.navigate(['/subscription/setup']);
      return false;
    }
  }

  private hasExceededLimits(plan: any): boolean {
    // Implementar verificações de limites
    // Ex: número de itens, usuários, etc.
    return false; // Placeholder
  }

  private getExceededFeature(plan: any): string {
    // Retornar qual feature excedeu o limite
    return 'items'; // Placeholder
  }
}
```

Esta implementação frontend completa o sistema SaaS, oferecendo uma experiência fluida para estabelecimentos assinarem, gerenciarem e fazerem upgrade de seus planos.