import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  receiptOutline, checkmarkCircleOutline, timeOutline,
  alertCircleOutline, closeCircleOutline, qrCodeOutline,
  eyeOutline, cardOutline, businessOutline, calendarOutline
} from 'ionicons/icons';
import { Invoice } from 'src/app/services/payment/payment.service';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class InvoiceListComponent {
  invoices = input<Invoice[]>([]);
  isLoading = input<boolean>(false);
  showCompany = input<boolean>(true);
  isSuperAdmin = input<boolean>(false);

  pay = output<Invoice>();
  view = output<Invoice>();
  pix = output<Invoice>();

  constructor() {
    addIcons({
      receiptOutline, checkmarkCircleOutline, timeOutline,
      alertCircleOutline, closeCircleOutline, qrCodeOutline,
      eyeOutline, cardOutline, businessOutline, calendarOutline
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'paid': return 'status-badge--paid';
      case 'pending': return 'status-badge--pending';
      case 'overdue': return 'status-badge--overdue';
      default: return 'status-badge--cancelled';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Atrasado';
      case 'cancelled': return 'Cancelado';
      default: return status || 'Pendente';
    }
  }

  getCompanyName(invoice: Invoice): string {
    if (!invoice.company_id) return 'N/A';
    if (typeof invoice.company_id === 'object') {
      return invoice.company_id.name || invoice.company_id.short_name || 'Estabelecimento';
    }
    return 'Estabelecimento';
  }
}
