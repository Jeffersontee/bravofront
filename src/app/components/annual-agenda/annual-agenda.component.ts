import { Component, OnInit, input, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ServiceOrderService, ServiceOrder } from '../../services/service-order/service-order.service';
import { Unit } from '../../services/unit/unit.service';
import { ServiceItem } from '../../services/service/service.service';
import { Router } from '@angular/router';
import { Strings } from '../../enum/strings';
import { StatusUtil } from '../../utils/status.util';
import { addIcons } from 'ionicons';
import { calendarOutline, mapOutline, timeOutline, personOutline, constructOutline, fileTrayOutline, businessOutline } from 'ionicons/icons';

export interface AgendaDay {
  date: Date;
  orders: ServiceOrder[];
  isToday: boolean;
}

export interface AgendaMonth {
  index: number; // 0 to 11
  name: string;
  days: AgendaDay[];
  hasOrdersCount: number; // number of days with orders
}

@Component({
  selector: 'app-annual-agenda',
  templateUrl: './annual-agenda.component.html',
  styleUrls: ['./annual-agenda.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AnnualAgendaComponent implements OnInit {
  // Entradas (Signals)
  year = input.required<number>();
  mode = input<'company' | 'super_admin'>('company');
  companyId = input<string | null>(null);

  private serviceOrderService = inject(ServiceOrderService);
  private router = inject(Router);
  
  // Estado
  isLoading = signal<boolean>(false);
  months = signal<AgendaMonth[]>([]);

  constructor() {
    addIcons({ calendarOutline, mapOutline, timeOutline, personOutline, constructOutline, fileTrayOutline, businessOutline });

    effect(() => {
      const selectedYear = this.year();
      const cId = this.companyId();
      if (selectedYear) {
        this.loadAgenda(selectedYear, cId);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {}

  private generateEmptyYear(year: number): AgendaMonth[] {
    const monthNames = [
      'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
      'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
    ];
    const months: AgendaMonth[] = [];
    const today = new Date();

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const days: AgendaDay[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, monthIndex, day);
        const isToday = 
          date.getDate() === today.getDate() && 
          date.getMonth() === today.getMonth() && 
          date.getFullYear() === today.getFullYear();
          
        days.push({
          date,
          orders: [],
          isToday
        });
      }

      months.push({
        index: monthIndex,
        name: monthNames[monthIndex],
        days,
        hasOrdersCount: 0
      });
    }

    return months;
  }

  private async loadAgenda(year: number, companyId: string | null) {
    this.isLoading.set(true);
    
    const emptyYear = this.generateEmptyYear(year);

    const startDate = `${year}-01-01T00:00:00.000Z`;
    const endDate = `${year}-12-31T23:59:59.999Z`;
    
    const filters: any = { start_date: startDate, end_date: endDate };
    if (companyId) {
      filters.company_id = companyId;
    }

    this.serviceOrderService.getServiceOrders(filters).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          res.data.forEach(order => {
            if (order.scheduled_date) {
              const d = new Date(order.scheduled_date);
              if (d.getFullYear() === year) {
                const mIndex = d.getMonth();
                const dIndex = d.getDate() - 1; 
                if (emptyYear[mIndex] && emptyYear[mIndex].days[dIndex]) {
                  emptyYear[mIndex].days[dIndex].orders.push(order);
                }
              }
            }
          });

          emptyYear.forEach(month => {
            month.hasOrdersCount = month.days.filter(d => d.orders.length > 0).length;
          });
        }
        this.months.set(emptyYear);
        this.isLoading.set(false);
      },
      error: () => {
        this.months.set(emptyYear);
        this.isLoading.set(false);
      }
    });
  }

  getUnitName(order: ServiceOrder): string {
    if (typeof order.unit_id === 'object' && order.unit_id !== null) {
      return (order.unit_id as Unit).name || 'Unidade Desconhecida';
    }
    return 'Unidade';
  }

  getCompanyName(order: ServiceOrder): string {
    if (typeof order.company_id === 'object' && order.company_id !== null) {
      return (order.company_id as any).name || 'Company';
    }
    return 'Company';
  }

  getServiceName(order: ServiceOrder): string {
    if (typeof order.service_id === 'object' && order.service_id !== null) {
      return (order.service_id as ServiceItem).name || 'Serviço';
    }
    return 'Serviço';
  }

  getStatusColor(status: string): string {
    return StatusUtil.getStatusColor(status);
  }

  getStatusLabel(status: string): string {
    return StatusUtil.getStatusLabel(status);
  }

  formatDateDay(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  }

  formatWeekday(date: Date): string {
    const weekdays = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
    return weekdays[date.getDay()];
  }

  goToOrder(orderId: string | undefined) {
    if (orderId) {
      const baseUrl = this.mode() === 'super_admin' ? Strings.SUPER_OPERATIONAL_ORDERS_DETAILS : Strings.COMPANY_ORDER_DETAILS;
      this.router.navigate([`/${baseUrl}`, orderId]);
    }
  }
}
