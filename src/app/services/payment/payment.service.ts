import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface Invoice {
  _id: string;
  company_id: any;
  subscription_id?: any;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  payment_method?: string;
  payment_date?: string | Date;
  due_date: string | Date;
  external_id?: string;
  pdf_url?: string;
  notes?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface InvoiceStats {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  monthlyGrowth: { month: string; amount: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private invoiceUrl = `${environment.serverUrl}invoices`;

  private getHeaders() {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getInvoices(params?: any): Observable<{ success: boolean; data: Invoice[]; total: number; page: number; totalPages: number }> {
    return this.http.get<{ success: boolean; data: Invoice[]; total: number; page: number; totalPages: number }>(this.invoiceUrl, {
      headers: this.getHeaders(),
      params: params || {}
    });
  }

  getInvoiceStats(companyId?: string): Observable<{ success: boolean; data: InvoiceStats }> {
    const params: any = {};
    if (companyId && companyId !== 'ALL') {
      params.company_id = companyId;
    }
    return this.http.get<{ success: boolean; data: InvoiceStats }>(`${this.invoiceUrl}/stats`, {
      headers: this.getHeaders(),
      params
    });
  }

  getInvoiceById(id: string): Observable<{ success: boolean; data: Invoice }> {
    return this.http.get<{ success: boolean; data: Invoice }>(`${this.invoiceUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  markAsPaid(id: string): Observable<{ success: boolean; data: Invoice }> {
    return this.http.post<{ success: boolean; data: Invoice }>(`${this.invoiceUrl}/${id}/pay`, {}, {
      headers: this.getHeaders()
    });
  }

  generatePixForInvoice(id: string): Observable<{ success: boolean; message: string; data: { qr_code_base64?: string; qr_code?: string; amount: number } }> {
    return this.http.post<{ success: boolean; message: string; data: { qr_code_base64?: string; qr_code?: string; amount: number } }>(`${this.invoiceUrl}/${id}/pix`, {}, {
      headers: this.getHeaders()
    });
  }
}
