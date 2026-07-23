import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButtons, IonMenuButton,
  IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonBadge, IonSegment, IonSegmentButton,
  IonLabel, IonList, IonSkeletonText, IonRefresher, IonRefresherContent, IonButton,
  IonSearchbar, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  buildOutline, locationOutline, timeOutline, alertCircleOutline,
  checkmarkCircleOutline, documentTextOutline, carOutline, mapOutline,
  receiptOutline, calendarOutline, flashOutline, chevronForwardOutline, 
  addCircleOutline, refreshOutline, pencilOutline, funnelOutline
} from 'ionicons/icons';
import { ServiceOrder } from 'src/app/services/service-order/service-order.service';

@Component({
  selector: 'app-service-order-list',
  templateUrl: './service-order-list.component.html',
  styleUrls: ['./service-order-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButtons, IonMenuButton,
    IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonBadge, IonSegment, IonSegmentButton,
    IonLabel, IonList, IonSkeletonText, IonRefresher, IonRefresherContent, IonButton, IonSearchbar,
    IonSelect, IonSelectOption
  ]
})
export class ServiceOrderListComponent {
  // Inputs via Angular Signals
  orders = input.required<ServiceOrder[]>();
  isLoading = input<boolean>(false);
  role = input<'super' | 'company' | 'collaborator' | 'client'>('client');
  pageTitle = input<string>('Listagem de Ordens');
  pageSubtitle = input<string>('Acompanhe suas solicitações e visitas técnicas em tempo real.');
  showCreateButton = input<boolean>(false);
  createButtonText = input<string>('Solicitar Serviço');

  // Outputs via Angular 18 output API
  onCreate = output<void>();
  onDetails = output<ServiceOrder>();
  onEdit = output<{ event: Event; order: ServiceOrder }>();
  onRefresh = output<any>();

  // Estados locais do componente reativo
  selectedSegment = signal<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  searchQuery = signal<string>('');

  // Novos filtros avançados
  selectedStatusFilter = signal<string>('');
  selectedCategoryFilter = signal<string>('');
  selectedUnitFilter = signal<string>('');

  // Métricas computadas locais baseadas nos inputs reativos
  totalCount = computed(() => this.orders().length);
  scheduledCount = computed(() => this.orders().filter(o => o.current_status === 'AGENDADO').length);
  inProgressCount = computed(() => this.orders().filter(o =>
    o.current_status === 'EM_DESLOCAMENTO' || o.current_status === 'CHECK_IN' || o.current_status === 'EM_EXECUCAO'
  ).length);
  completedCount = computed(() => this.orders().filter(o => o.current_status === 'CONCLUIDO').length);

  // Unidades disponíveis na listagem atual para popular o filtro
  availableUnits = computed(() => {
    const unitsMap = new Map();
    this.orders().forEach(o => {
      const u = o.unit_id as any;
      if (u && u._id) {
        unitsMap.set(u._id, u.name);
      }
    });
    return Array.from(unitsMap.entries()).map(([id, name]) => ({ id, name }));
  });

  // Categorias disponíveis na listagem atual para popular o filtro
  availableCategories = computed(() => {
    const categoriesSet = new Set<string>();
    this.orders().forEach(o => {
      const cat = (o.service_id as any)?.category;
      if (cat) categoriesSet.add(cat);
    });
    return Array.from(categoriesSet);
  });

  // Lista filtrada internamente para manter sincronia reativa de combos/filtros
  filteredOrders = computed(() => {
    const segment = this.selectedSegment();
    const query = this.searchQuery().toLowerCase().trim();
    const statusF = this.selectedStatusFilter();
    const categoryF = this.selectedCategoryFilter();
    const unitF = this.selectedUnitFilter();
    
    let list = this.orders();

    // Segmentos básicos
    if (segment === 'pending') {
      list = list.filter(o => o.current_status === 'AGENDADO');
    } else if (segment === 'in_progress') {
      list = list.filter(o =>
        o.current_status === 'EM_DESLOCAMENTO' || o.current_status === 'CHECK_IN' || o.current_status === 'EM_EXECUCAO'
      );
    } else if (segment === 'completed') {
      list = list.filter(o => o.current_status === 'CONCLUIDO');
    }

    // Filtros avançados
    if (statusF) {
      list = list.filter(o => o.current_status === statusF);
    }
    if (categoryF) {
      list = list.filter(o => (o.service_id as any)?.category === categoryF);
    }
    if (unitF) {
      list = list.filter(o => {
        const uId = typeof o.unit_id === 'object' ? (o.unit_id as any)._id : o.unit_id;
        return uId === unitF;
      });
    }

    // Busca textual
    if (query) {
      list = list.filter(o => {
        const serviceName = (o.service_id as any)?.name || '';
        const companyName = (o.company_id as any)?.name || '';
        const unitName = (o.unit_id as any)?.name || '';
        const statusLabel = this.getStatusLabel(o.current_status) || '';

        return serviceName.toLowerCase().includes(query) ||
               companyName.toLowerCase().includes(query) ||
               unitName.toLowerCase().includes(query) ||
               statusLabel.toLowerCase().includes(query);
      });
    }

    return list;
  });

  constructor() {
    addIcons({
      buildOutline, locationOutline, timeOutline, alertCircleOutline,
      checkmarkCircleOutline, documentTextOutline, carOutline, mapOutline,
      receiptOutline, calendarOutline, flashOutline, chevronForwardOutline, 
      addCircleOutline, refreshOutline, pencilOutline, funnelOutline
    });
  }

  handleRefresh(event: any) {
    this.onRefresh.emit(event);
  }

  handleCreate() {
    this.onCreate.emit();
  }

  handleDetails(order: ServiceOrder) {
    this.onDetails.emit(order);
  }

  handleEdit(event: Event, order: ServiceOrder) {
    this.onEdit.emit({ event, order });
  }

  segmentChanged(event: any) {
    this.selectedSegment.set(event.detail.value);
  }

  onSearchInput(event: any) {
    this.searchQuery.set(event.target.value || '');
  }

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
      case 'EM_DESLOCAMENTO': return 'Em Deslocamento';
      case 'CHECK_IN': return 'Check-in';
      case 'EM_EXECUCAO': return 'Em Execução';
      case 'CONCLUIDO': return 'Concluído';
      case 'CANCELADO': return 'Cancelado';
      default: return status;
    }
  }
}
