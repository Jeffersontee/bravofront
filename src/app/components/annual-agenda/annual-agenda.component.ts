import { Component, OnInit, input, inject, signal, effect, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ServiceOrderService, ServiceOrder } from '../../services/service-order/service-order.service';
import { Unit } from '../../services/unit/unit.service';
import { ServiceItem } from '../../services/service/service.service';
import { Router } from '@angular/router';
import { Strings } from '../../enum/strings';
import { StatusUtil } from '../../utils/status.util';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-annual-agenda',
  templateUrl: './annual-agenda.component.html',
  styleUrls: ['./annual-agenda.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, FullCalendarModule]
})
export class AnnualAgendaComponent implements OnInit {
  year = input.required<number>();
  mode = input<'company' | 'super_admin'>('company');
  companyId = input<string | null>(null);

  private serviceOrderService = inject(ServiceOrderService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);
  
  isLoading = signal<boolean>(false);
  
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    buttonText: {
      today: 'Hoje',
      month: 'Mês',
      week: 'Semana',
      day: 'Dia'
    },
    locale: 'pt-br',
    slotMinTime: '00:00:00',
    slotMaxTime: '23:59:59',
    allDaySlot: false,
    navLinks: true, // can click day/week names to navigate views
    editable: false,
    selectable: true,
    events: [],
    eventClick: this.handleEventClick.bind(this)
  };

  constructor() {
    effect(() => {
      const selectedYear = this.year();
      const cId = this.companyId();
      if (selectedYear) {
        this.loadAgenda(selectedYear, cId);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {}

  private async loadAgenda(year: number, companyId: string | null) {
    this.isLoading.set(true);

    const startDate = `${year}-01-01T00:00:00.000Z`;
    const endDate = `${year}-12-31T23:59:59.999Z`;
    
    const filters: any = { start_date: startDate, end_date: endDate };
    if (companyId) {
      filters.company_id = companyId;
    }

    this.serviceOrderService.getServiceOrders(filters).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const events: EventInput[] = res.data
            .filter(order => order.scheduled_date)
            .map(order => {
              const serviceName = this.getServiceName(order);
              const locationName = this.mode() === 'super_admin' 
                  ? `${this.getCompanyName(order)} - ${this.getUnitName(order)}`
                  : this.getUnitName(order);

              // Assume 1 hora de duração padrão para exibição na grade de horário se não houver end_date explícito
              const startDate = new Date(order.scheduled_date as string);
              const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour
              
              const hexColor = this.getCssVariableColor(this.getStatusColor(order.current_status));

              return {
                id: order._id,
                title: `${serviceName} | ${locationName}`,
                start: startDate,
                end: endDate,
                backgroundColor: hexColor,
                borderColor: hexColor,
                extendedProps: {
                  orderId: order._id
                }
              };
            });
            
          this.calendarOptions = {
            ...this.calendarOptions,
            events: events
          };
          this.cd.detectChanges();
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  handleEventClick(clickInfo: EventClickArg) {
    const orderId = clickInfo.event.extendedProps['orderId'];
    if (orderId) {
      this.goToOrder(orderId);
    }
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
  
  // Converts ionic color names (e.g., 'primary', 'success') to hex values for FullCalendar
  private getCssVariableColor(colorName: string): string {
    const style = getComputedStyle(document.body);
    const varName = `--ion-color-${colorName}`;
    const colorValue = style.getPropertyValue(varName).trim();
    return colorValue || '#3880ff'; // fallback to ionic primary
  }

  goToOrder(orderId: string | undefined) {
    if (orderId) {
      const baseUrl = this.mode() === 'super_admin' ? Strings.SUPER_OPERATIONAL_ORDERS_DETAILS : Strings.COMPANY_ORDER_DETAILS;
      this.router.navigate([`/${baseUrl}`, orderId]);
    }
  }
}

