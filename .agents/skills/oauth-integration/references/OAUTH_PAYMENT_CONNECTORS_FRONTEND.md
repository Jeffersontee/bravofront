# 🔗 OAuth Payment Connectors - Frontend Implementation

## 📱 Componentes e Páginas Frontend

### **1. Página de Callback OAuth**

```typescript
// pages/payment-connector-callback/payment-connector-callback.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { PaymentConnectorService } from '../../services/payment-connector/payment-connector.service';

@Component({
  selector: 'app-payment-connector-callback',
  templateUrl: './payment-connector-callback.page.html',
  styleUrls: ['./payment-connector-callback.page.scss'],
})
export class PaymentConnectorCallbackPage implements OnInit {
  status: 'loading' | 'success' | 'error' = 'loading';
  message = '';
  connectorId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentConnectorService: PaymentConnectorService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.handleCallback();
  }

  async handleCallback() {
    try {
      const status = this.route.snapshot.queryParamMap.get('status');
      const connectorId = this.route.snapshot.queryParamMap.get('connector_id');
      const error = this.route.snapshot.queryParamMap.get('error');

      if (error) {
        this.status = 'error';
        this.message = this.getErrorMessage(error);
        return;
      }

      if (status === 'connected' && connectorId) {
        this.status = 'success';
        this.message = 'Conta conectada com sucesso!';
        this.connectorId = connectorId;

        // Redirecionar após 3 segundos
        setTimeout(() => {
          this.router.navigate(['/establishment/dashboard']);
        }, 3000);

      } else {
        this.status = 'error';
        this.message = 'Erro desconhecido na conexão';
      }

    } catch (error) {
      console.error('Erro no callback:', error);
      this.status = 'error';
      this.message = 'Erro interno do sistema';
    }
  }

  private getErrorMessage(error: string): string {
    const errorMessages = {
      'access_denied': 'Acesso negado pelo gateway de pagamento',
      'connection_failed': 'Falha na conexão. Tente novamente.',
      'invalid_scope': 'Permissões insuficientes',
      'server_error': 'Erro no servidor. Tente novamente mais tarde.'
    };

    return errorMessages[error] || 'Erro desconhecido';
  }

  goToDashboard() {
    this.router.navigate(['/establishment/dashboard']);
  }

  tryAgain() {
    this.router.navigate(['/payment-connector']);
  }
}
```

```html
<!-- payment-connector-callback.page.html -->
<ion-header>
  <ion-toolbar>
    <ion-title>Conectando Conta</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content class="callback-content">
  <div class="callback-container">
    <!-- Loading -->
    <div *ngIf="status === 'loading'" class="status-container">
      <ion-spinner name="crescent" class="large-spinner"></ion-spinner>
      <h2>Conectando sua conta...</h2>
      <p>Por favor, aguarde enquanto processamos sua conexão.</p>
    </div>

    <!-- Success -->
    <div *ngIf="status === 'success'" class="status-container success">
      <ion-icon name="checkmark-circle" color="success" class="large-icon"></ion-icon>
      <h2>{{ message }}</h2>
      <p>Você será redirecionado para o dashboard em alguns segundos.</p>

      <ion-button fill="solid" color="primary" (click)="goToDashboard()">
        Ir para Dashboard
      </ion-button>
    </div>

    <!-- Error -->
    <div *ngIf="status === 'error'" class="status-container error">
      <ion-icon name="close-circle" color="danger" class="large-icon"></ion-icon>
      <h2>Erro na Conexão</h2>
      <p>{{ message }}</p>

      <div class="error-actions">
        <ion-button fill="outline" (click)="tryAgain()">
          Tentar Novamente
        </ion-button>
        <ion-button fill="solid" color="primary" (click)="goToDashboard()">
          Ir para Dashboard
        </ion-button>
      </div>
    </div>
  </div>
</ion-content>
```

### **2. Página de Pagamentos do Estabelecimento**

```typescript
// pages/establishment/payments/payments.page.ts
import { Component, OnInit } from '@angular/core';
import { PaymentConnectorService } from '../../../services/payment-connector/payment-connector.service';
import { ModalController } from '@ionic/angular';
import { PaymentDetailsModalComponent } from '../../../components/payment-details-modal/payment-details-modal.component';

@Component({
  selector: 'app-establishment-payments',
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
})
export class EstablishmentPaymentsPage implements OnInit {
  payments: any[] = [];
  loading = true;
  currentPage = 1;
  totalPages = 1;
  filters = {
    status: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  };

  constructor(
    private paymentConnectorService: PaymentConnectorService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadPayments();
  }

  async loadPayments(page = 1, loadMore = false) {
    try {
      this.loading = true;
      const result = await this.paymentConnectorService.getPayments(page, 20, this.filters).toPromise();

      if (loadMore) {
        this.payments = [...this.payments, ...result.payments];
      } else {
        this.payments = result.payments;
      }

      this.currentPage = result.current_page;
      this.totalPages = result.total_pages;

    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadMore(event: any) {
    if (this.currentPage < this.totalPages) {
      await this.loadPayments(this.currentPage + 1, true);
    }
    event.target.complete();
  }

  async viewPaymentDetails(payment: any) {
    const modal = await this.modalCtrl.create({
      component: PaymentDetailsModalComponent,
      componentProps: {
        payment: payment
      }
    });
    await modal.present();
  }

  async applyFilters() {
    this.currentPage = 1;
    await this.loadPayments(1);
  }

  clearFilters() {
    this.filters = {
      status: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: ''
    };
    this.loadPayments(1);
  }

  getStatusColor(status: string): string {
    const colors = {
      'succeeded': 'success',
      'processing': 'warning',
      'failed': 'danger',
      'cancelled': 'medium',
      'refunded': 'tertiary'
    };
    return colors[status] || 'primary';
  }

  getStatusText(status: string): string {
    const texts = {
      'succeeded': 'Pago',
      'processing': 'Processando',
      'failed': 'Falhou',
      'cancelled': 'Cancelado',
      'refunded': 'Reembolsado'
    };
    return texts[status] || status;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
```

```html
<!-- payments.page.html -->
<ion-header>
  <ion-toolbar>
    <ion-title>Meus Recebimentos</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <!-- Filters -->
  <ion-card class="filters-card">
    <ion-card-content>
      <form (ngSubmit)="applyFilters()">
        <ion-row>
          <ion-col size="6">
            <ion-item>
              <ion-label>Status</ion-label>
              <ion-select [(ngModel)]="filters.status" name="status">
                <ion-select-option value="">Todos</ion-select-option>
                <ion-select-option value="succeeded">Pago</ion-select-option>
                <ion-select-option value="processing">Processando</ion-select-option>
                <ion-select-option value="failed">Falhou</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-col>
          <ion-col size="6">
            <ion-item>
              <ion-label>De</ion-label>
              <ion-datetime
                [(ngModel)]="filters.dateFrom"
                name="dateFrom"
                display-format="DD/MM/YYYY"
                picker-format="DD/MM/YYYY">
              </ion-datetime>
            </ion-item>
          </ion-col>
        </ion-row>

        <ion-row>
          <ion-col size="6">
            <ion-item>
              <ion-label>Valor Mín.</ion-label>
              <ion-input
                [(ngModel)]="filters.amountMin"
                name="amountMin"
                type="number"
                placeholder="0.00">
              </ion-input>
            </ion-item>
          </ion-col>
          <ion-col size="6">
            <ion-item>
              <ion-label>Valor Máx.</ion-label>
              <ion-input
                [(ngModel)]="filters.amountMax"
                name="amountMax"
                type="number"
                placeholder="0.00">
              </ion-input>
            </ion-item>
          </ion-col>
        </ion-row>

        <ion-row>
          <ion-col size="6">
            <ion-button expand="block" type="submit" color="primary">
              Filtrar
            </ion-button>
          </ion-col>
          <ion-col size="6">
            <ion-button expand="block" fill="outline" (click)="clearFilters()">
              Limpar
            </ion-button>
          </ion-col>
        </ion-row>
      </form>
    </ion-card-content>
  </ion-card>

  <!-- Payments List -->
  <ion-list *ngIf="!loading">
    <ion-item *ngFor="let payment of payments" (click)="viewPaymentDetails(payment)">
      <ion-avatar slot="start">
        <ion-icon [name]="getPaymentIcon(payment.status)" [color]="getStatusColor(payment.status)"></ion-icon>
      </ion-avatar>

      <ion-label>
        <h2>{{ formatCurrency(payment.amount) }}</h2>
        <p>{{ payment.customer_info?.name || 'Cliente não informado' }}</p>
        <p class="payment-date">{{ formatDate(payment.created_at) }}</p>
      </ion-label>

      <ion-badge [color]="getStatusColor(payment.status)" slot="end">
        {{ getStatusText(payment.status) }}
      </ion-badge>
    </ion-item>
  </ion-list>

  <!-- Loading -->
  <div *ngIf="loading" class="loading-container">
    <ion-spinner></ion-spinner>
    <p>Carregando pagamentos...</p>
  </div>

  <!-- Empty State -->
  <div *ngIf="!loading && payments.length === 0" class="empty-state">
    <ion-icon name="receipt-outline" class="empty-icon"></ion-icon>
    <h3>Nenhum pagamento encontrado</h3>
    <p>Seus recebimentos aparecerão aqui quando houver vendas.</p>
  </div>

  <!-- Infinite Scroll -->
  <ion-infinite-scroll (ionInfinite)="loadMore($event)" *ngIf="currentPage < totalPages">
    <ion-infinite-scroll-content loadingText="Carregando mais...">
    </ion-infinite-scroll-content>
  </ion-infinite-scroll>
</ion-content>
```

### **3. Modal de Detalhes do Pagamento**

```typescript
// components/payment-details-modal/payment-details-modal.component.ts
import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-payment-details-modal',
  templateUrl: './payment-details-modal.component.html',
  styleUrls: ['./payment-details-modal.component.scss'],
})
export class PaymentDetailsModalComponent {
  @Input() payment: any;

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  getStatusColor(status: string): string {
    const colors = {
      'succeeded': 'success',
      'processing': 'warning',
      'failed': 'danger',
      'cancelled': 'medium',
      'refunded': 'tertiary'
    };
    return colors[status] || 'primary';
  }

  getStatusText(status: string): string {
    const texts = {
      'succeeded': 'Pago',
      'processing': 'Processando',
      'failed': 'Falhou',
      'cancelled': 'Cancelado',
      'refunded': 'Reembolsado'
    };
    return texts[status] || status;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPaymentMethodText(payment: any): string {
    if (!payment.payment_method) return 'Não informado';

    const method = payment.payment_method;
    let text = '';

    switch (method.type) {
      case 'credit_card':
        text = `Cartão de Crédito ${method.card_brand || ''}`.trim();
        break;
      case 'debit_card':
        text = `Cartão de Débito ${method.card_brand || ''}`.trim();
        break;
      case 'pix':
        text = 'PIX';
        break;
      case 'bank_transfer':
        text = 'Transferência Bancária';
        break;
      default:
        text = method.type;
    }

    if (method.last4) {
      text += ` **** ${method.last4}`;
    }

    return text;
  }
}
```

```html
<!-- payment-details-modal.component.html -->
<ion-header>
  <ion-toolbar>
    <ion-title>Detalhes do Pagamento</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="dismiss()">
        <ion-icon name="close"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-card>
    <ion-card-header [color]="getStatusColor(payment.status)">
      <ion-card-title>
        <ion-icon [name]="payment.status === 'succeeded' ? 'checkmark-circle' : 'time-outline'" slot="start"></ion-icon>
        {{ getStatusText(payment.status) }}
      </ion-card-title>
      <ion-card-subtitle>{{ formatCurrency(payment.amount) }}</ion-card-subtitle>
    </ion-card-header>

    <ion-card-content>
      <!-- Informações Básicas -->
      <ion-list>
        <ion-item>
          <ion-icon name="calendar" slot="start"></ion-icon>
          <ion-label>
            <h3>Data</h3>
            <p>{{ formatDate(payment.created_at) }}</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-icon name="cash" slot="start"></ion-icon>
          <ion-label>
            <h3>Valor</h3>
            <p>{{ formatCurrency(payment.amount) }}</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-icon name="card" slot="start"></ion-icon>
          <ion-label>
            <h3>Método de Pagamento</h3>
            <p>{{ getPaymentMethodText(payment) }}</p>
          </ion-label>
        </ion-item>

        <ion-item *ngIf="payment.gateway_fee">
          <ion-icon name="remove-circle" slot="start" color="danger"></ion-icon>
          <ion-label>
            <h3>Taxa do Gateway</h3>
            <p>{{ formatCurrency(payment.gateway_fee) }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <!-- Informações do Cliente -->
      <ion-card *ngIf="payment.customer_info">
        <ion-card-header>
          <ion-card-title>Cliente</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-icon name="person" slot="start"></ion-icon>
              <ion-label>
                <h3>Nome</h3>
                <p>{{ payment.customer_info.name }}</p>
              </ion-label>
            </ion-item>

            <ion-item *ngIf="payment.customer_info.email">
              <ion-icon name="mail" slot="start"></ion-icon>
              <ion-label>
                <h3>Email</h3>
                <p>{{ payment.customer_info.email }}</p>
              </ion-label>
            </ion-item>

            <ion-item *ngIf="payment.customer_info.document">
              <ion-icon name="document" slot="start"></ion-icon>
              <ion-label>
                <h3>Documento</h3>
                <p>{{ payment.customer_info.document }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <!-- Informações Técnicas -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Informações Técnicas</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-icon name="code" slot="start"></ion-icon>
              <ion-label>
                <h3>ID do Gateway</h3>
                <p>{{ payment.gateway_payment_id }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-icon name="git-branch" slot="start"></ion-icon>
              <ion-label>
                <h3>Gateway</h3>
                <p>{{ payment.gateway | titlecase }}</p>
              </ion-label>
            </ion-item>

            <ion-item *ngIf="payment.processed_at">
              <ion-icon name="time" slot="start"></ion-icon>
              <ion-label>
                <h3>Processado em</h3>
                <p>{{ formatDate(payment.processed_at) }}</p>
              </ion-label>
            </ion-item>

            <ion-item *ngIf="payment.confirmed_at">
              <ion-icon name="checkmark-done" slot="start" color="success"></ion-icon>
              <ion-label>
                <h3>Confirmado em</h3>
                <p>{{ formatDate(payment.confirmed_at) }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <!-- Erro (se houver) -->
      <ion-card *ngIf="payment.failure_reason" color="danger">
        <ion-card-header>
          <ion-card-title>
            <ion-icon name="alert-circle" slot="start"></ion-icon>
            Erro no Pagamento
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>{{ payment.failure_reason }}</p>
        </ion-card-content>
      </ion-card>
    </ion-card-content>
  </ion-card>
</ion-content>
```

---

## 🎨 Estilos SCSS

### **1. Payment Connector Styles**

```scss
// payment-connector.component.scss
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

.status-info {
  h3 {
    margin: 0 0 12px 0;
    font-size: 1.2em;
  }
}

.connection-details {
  p {
    margin: 8px 0;
    font-size: 0.9em;
    color: var(--ion-color-medium);

    strong {
      color: var(--ion-color-dark);
    }
  }
}

.warning-message {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(var(--ion-color-warning-rgb), 0.1);
  padding: 12px;
  border-radius: 8px;
  margin-top: 16px;

  ion-icon {
    font-size: 1.2em;
  }

  span {
    font-size: 0.9em;
    color: var(--ion-color-warning-contrast);
  }
}

.gateway-button {
  margin-bottom: 12px;
  --border-radius: 8px;

  ion-icon {
    margin-right: 8px;
  }
}

.disconnect-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(var(--ion-color-danger-rgb), 0.1);
  padding: 12px;
  border-radius: 8px;
  margin-top: 16px;
  font-size: 0.9em;

  ion-icon {
    font-size: 1.2em;
  }
}
```

### **2. Callback Page Styles**

```scss
// payment-connector-callback.page.scss
.callback-content {
  --background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-secondary) 100%);
}

.callback-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  text-align: center;
}

.status-container {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;

  h2 {
    margin: 16px 0;
    color: var(--ion-color-dark);
  }

  p {
    color: var(--ion-color-medium);
    margin-bottom: 24px;
  }

  &.success {
    ion-icon {
      color: var(--ion-color-success);
    }
  }

  &.error {
    ion-icon {
      color: var(--ion-color-danger);
    }
  }
}

.large-spinner {
  --size: 48px;
}

.large-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.error-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;

  ion-button {
    flex: 1;
  }
}
```

### **3. Payments Page Styles**

```scss
// payments.page.scss
.filters-card {
  margin-bottom: 16px;

  form {
    ion-row {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    ion-item {
      --border-radius: 8px;
      margin-bottom: 8px;
    }

    ion-button {
      --border-radius: 8px;
    }
  }
}

ion-list {
  ion-item {
    --border-radius: 8px;
    margin-bottom: 8px;
    cursor: pointer;

    ion-avatar {
      --size: 48px;
      background: var(--ion-color-light);
      display: flex;
      align-items: center;
      justify-content: center;

      ion-icon {
        font-size: 24px;
      }
    }

    h2 {
      font-weight: 600;
      color: var(--ion-color-primary);
    }

    p {
      margin: 4px 0;

      &.payment-date {
        font-size: 0.8em;
        color: var(--ion-color-medium);
      }
    }

    ion-badge {
      font-size: 0.8em;
    }
  }
}

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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  color: var(--ion-color-medium);

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  h3 {
    margin: 16px 0 8px 0;
    color: var(--ion-color-dark);
  }

  p {
    max-width: 280px;
    line-height: 1.5;
  }
}
```

### **4. Payment Details Modal Styles**

```scss
// payment-details-modal.component.scss
ion-card {
  margin: 0;
  border-radius: 0;

  &[color] {
    --background: rgba(var(--ion-color-primary-rgb), 0.05);
  }

  ion-list {
    background: transparent;

    ion-item {
      --background: rgba(255, 255, 255, 0.8);
      --border-radius: 8px;
      margin-bottom: 8px;

      ion-icon {
        color: var(--ion-color-primary);
      }

      h3 {
        font-size: 0.9em;
        margin-bottom: 4px;
      }

      p {
        font-size: 0.85em;
        color: var(--ion-color-medium);
      }
    }
  }

  // Nested cards
  ion-card {
    margin: 16px 0;
    box-shadow: none;
    border: 1px solid var(--ion-color-light-shade);

    ion-card-header {
      padding-bottom: 8px;

      ion-card-title {
        font-size: 1em;
      }
    }

    ion-list {
      ion-item {
        --background: transparent;
        --border-radius: 0;
        --inner-border-width: 0;
        margin-bottom: 4px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
```

---

## 🔧 Guards e Interceptors

### **1. Payment Connector Guard**

```typescript
// guards/payment-connector.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { PaymentConnectorService } from '../services/payment-connector/payment-connector.service';
import { ModalController } from '@ionic/angular';
import { PaymentConnectorComponent } from '../components/payment-connector/payment-connector.component';

@Injectable({
  providedIn: 'root'
})
export class PaymentConnectorGuard implements CanActivate {
  constructor(
    private paymentConnectorService: PaymentConnectorService,
    private router: Router,
    private modalCtrl: ModalController
  ) {}

  async canActivate(): Promise<boolean> {
    try {
      const status = await this.paymentConnectorService.getStatus().toPromise();

      if (status.connected && status.status === 'active') {
        return true;
      }

      // Mostrar modal para conectar
      const modal = await this.modalCtrl.create({
        component: PaymentConnectorComponent,
        backdropDismiss: false,
        componentProps: {
          required: true
        }
      });

      modal.onDidDismiss().then((result) => {
        if (!result.data?.connected) {
          this.router.navigate(['/establishment/setup']);
        }
      });

      await modal.present();
      return false;

    } catch (error) {
      console.error('Erro no guard:', error);
      this.router.navigate(['/establishment/setup']);
      return false;
    }
  }
}
```

### **2. HTTP Interceptor para Payment Errors**

```typescript
// interceptors/payment-error.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';

@Injectable()
export class PaymentErrorInterceptor implements HttpInterceptor {
  constructor(private toastCtrl: ToastController) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.url?.includes('/payment-connectors/')) {
          this.handlePaymentError(error);
        }
        return throwError(error);
      })
    );
  }

  private async handlePaymentError(error: HttpErrorResponse) {
    let message = 'Erro no processamento de pagamento';

    switch (error.status) {
      case 400:
        message = 'Dados de pagamento inválidos';
        break;
      case 401:
        message = 'Token de acesso expirado. Reconecte sua conta.';
        break;
      case 403:
        message = 'Acesso negado ao gateway de pagamento';
        break;
      case 429:
        message = 'Muitas tentativas. Aguarde alguns minutos.';
        break;
      case 500:
        message = 'Erro interno do gateway. Tente novamente.';
        break;
    }

    const toast = await this.toastCtrl.create({
      message,
      duration: 5000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
}
```

---

## 📊 Analytics e Relatórios

### **1. Serviço de Analytics de Pagamentos**

```typescript
// services/payment-analytics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentAnalyticsService {
  private readonly API_URL = `${environment.serverUrl}/analytics/payments`;

  constructor(private http: HttpClient) {}

  // Receitas por período
  getRevenueMetrics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get(`${this.API_URL}/revenue`, { params });
  }

  // Volume de pagamentos
  getPaymentVolume(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);
    return this.http.get(`${this.API_URL}/volume`, { params });
  }

  // Taxas e custos
  getFeesAnalysis(): Observable<any> {
    return this.http.get(`${this.API_URL}/fees`);
  }

  // Métodos de pagamento mais usados
  getPaymentMethodsStats(): Observable<any> {
    return this.http.get(`${this.API_URL}/methods`);
  }

  // Comparação com período anterior
  getPeriodComparison(): Observable<any> {
    return this.http.get(`${this.API_URL}/comparison`);
  }

  // Exportar dados
  exportPayments(format: 'csv' | 'xlsx', filters: any): Observable<Blob> {
    let params = new HttpParams().set('format', format);

    // Adicionar filtros
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get(`${this.API_URL}/export`, {
      params,
      responseType: 'blob'
    });
  }
}
```

### **2. Componente de Dashboard de Receitas**

```typescript
// components/revenue-dashboard/revenue-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { PaymentAnalyticsService } from '../../services/payment-analytics.service';

@Component({
  selector: 'app-revenue-dashboard',
  templateUrl: './revenue-dashboard.component.html',
  styleUrls: ['./revenue-dashboard.component.scss'],
})
export class RevenueDashboardComponent implements OnInit {
  revenueMetrics: any = {};
  paymentVolume: any = {};
  feesAnalysis: any = {};
  loading = true;

  constructor(private analyticsService: PaymentAnalyticsService) {}

  ngOnInit() {
    this.loadAnalytics();
  }

  async loadAnalytics() {
    try {
      const [revenue, volume, fees] = await Promise.all([
        this.analyticsService.getRevenueMetrics().toPromise(),
        this.analyticsService.getPaymentVolume(
          this.getStartOfMonth(),
          this.getEndOfMonth()
        ).toPromise(),
        this.analyticsService.getFeesAnalysis().toPromise()
      ]);

      this.revenueMetrics = revenue;
      this.paymentVolume = volume;
      this.feesAnalysis = fees;

    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      this.loading = false;
    }
  }

  private getStartOfMonth(): string {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  }

  private getEndOfMonth(): string {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  }

  getRevenueChangeColor(): string {
    return this.revenueMetrics.change >= 0 ? 'success' : 'danger';
  }

  getVolumeChangeColor(): string {
    return this.paymentVolume.change >= 0 ? 'success' : 'danger';
  }
}
```

Esta implementação completa o sistema de OAuth Payment Connectors, oferecendo uma experiência completa para estabelecimentos conectarem suas contas e gerenciarem recebimentos de forma independente e segura.