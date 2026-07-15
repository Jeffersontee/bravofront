import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, 
  IonIcon, IonLabel, IonNote, IonList, IonItem 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  chevronBackOutline, cashOutline, thumbsUpOutline, closeCircleOutline, 
  chevronForwardOutline, documentTextOutline, timeOutline, checkmarkCircleOutline, 
  carOutline, checkboxOutline, flashOutline, hammerOutline, waterOutline, 
  constructOutline, wifiOutline, shieldCheckmarkOutline 
} from 'ionicons/icons';
import { OrderService, Order } from '../../../services/order/order.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, 
    IonButton, IonIcon, IonLabel, IonNote, IonList, IonItem
  ]
})
export class OrdersPage {
  public orderService = inject(OrderService);

  // Pedidos vindos do serviço reativo
  public orders = this.orderService.orders;

  // Signal para o pedido atualmente selecionado para ver detalhes
  public selectedOrderId = signal<string | null>(null);

  // Computed signal para obter os detalhes do pedido aberto
  public selectedOrder = computed(() => {
    const id = this.selectedOrderId();
    if (!id) return null;
    return this.orders().find(o => o.id === id) || null;
  });

  constructor() {
    addIcons({ 
      chevronBackOutline, cashOutline, thumbsUpOutline, closeCircleOutline, 
      chevronForwardOutline, documentTextOutline, timeOutline, checkmarkCircleOutline, 
      carOutline, checkboxOutline, flashOutline, hammerOutline, waterOutline, 
      constructOutline, wifiOutline, shieldCheckmarkOutline 
    });
  }

  public openOrderDetails(orderId: string) {
    this.selectedOrderId.set(orderId);
  }

  public goBackToList() {
    this.selectedOrderId.set(null);
  }

  public confirmBudget(orderId: string) {
    this.orderService.confirmBudget(orderId);
  }

  public rejectBudget(orderId: string) {
    this.orderService.rejectBudget(orderId);
    this.selectedOrderId.set(null);
  }

  // Retorna as classes ou ícones dependendo da categoria
  public getCategoryIcon(category: string): string {
    switch (category) {
      case 'Elétrica': return 'flash-outline';
      case 'Civil': return 'hammer-outline';
      case 'Hidráulica': return 'water-outline';
      case 'Serralheria': return 'construct-outline';
      case 'Rede e Tecnologia': return 'wifi-outline';
      case 'Serviços Preventivos': return 'shield-checkmark-outline';
      default: return 'construct-outline';
    }
  }

  public getCategoryBgColor(category: string): string {
    switch (category) {
      case 'Elétrica': return '#eff6ff';
      case 'Civil': return '#fef3c7';
      case 'Hidráulica': return '#ecfeff';
      case 'Serralheria': return '#f1f5f9';
      case 'Rede e Tecnologia': return '#ecfdf5';
      case 'Serviços Preventivos': return '#f5f3ff';
      default: return '#f1f5f9';
    }
  }

  public getCategoryIconColor(category: string): string {
    switch (category) {
      case 'Elétrica': return '#3b82f6';
      case 'Civil': return '#d97706';
      case 'Hidráulica': return '#0891b2';
      case 'Serralheria': return '#475569';
      case 'Rede e Tecnologia': return '#059669';
      case 'Serviços Preventivos': return '#7c3aed';
      default: return '#475569';
    }
  }

  // Verifica se a etapa da timeline deve ser marcada como concluída/ativa
  public isStepCompleted(order: Order, step: string): boolean {
    const statusOrder = ['Solicitado', 'Orçamento enviado', 'Confirmado pelo cliente', 'Técnico a caminho', 'Concluído'];
    const currentIdx = statusOrder.indexOf(order.status);
    const stepIdx = statusOrder.indexOf(step);
    return currentIdx >= stepIdx;
  }

  public isStepActive(order: Order, step: string): boolean {
    return order.status === step;
  }
}
