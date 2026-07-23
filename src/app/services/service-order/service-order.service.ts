import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Strings } from 'src/app/enum/strings';
import { Unit } from '../unit/unit.service';
import { ServiceItem } from '../service/service.service';

export interface TimelineEvent {
  status: 'SOLICITADO' | 'DATA_SUGERIDA' | 'PROPOSTO' | 'APROVADO' | 'AGENDADO' | 'EM_DESLOCAMENTO' | 'CHECK_IN' | 'EM_EXECUCAO' | 'RELATORIO_CHECKOUT' | 'AVALIACAO' | 'CONCLUIDO' | 'CANCELADO' | 'RECUSADO';
  timestamp: string | Date;
  location?: { lat: number; lng: number };
  notes?: string;
}

export interface ServiceOrder {
  _id?: string;
  company_id: string | any;
  unit_id: string | Unit;
  service_id: string | ServiceItem;
  collaborator_id?: string | any;
  scheduled_date?: string | Date;
  proposed_date?: string | Date;
  current_status: 'SOLICITADO' | 'DATA_SUGERIDA' | 'PROPOSTO' | 'APROVADO' | 'AGENDADO' | 'EM_DESLOCAMENTO' | 'CHECK_IN' | 'EM_EXECUCAO' | 'RELATORIO_CHECKOUT' | 'AVALIACAO' | 'CONCLUIDO' | 'CANCELADO' | 'RECUSADO';
  timeline?: TimelineEvent[];
  checkin_location?: { lat: number; lng: number };
  checkin_time?: string | Date;
  checkout_time?: string | Date;
  images_url?: string[];
  report_pdf_url?: string;
  follower_signature?: string;
  
  // Custom fields
  notes?: string;
  time_spent?: string;
  km_driven?: string;
  fuel_cost?: string;
  zone?: string;
  address_override?: string;
  observations?: string;

  // Novos campos comerciais e de acompanhante
  client_price?: number;
  client_price_addition?: number;
  technician_price?: number;
  requested_by?: string;
  contract_type?: 'subscription' | 'avulso';

  // Matriz GUT
  gut_gravity?: number;
  gut_urgency?: number;
  gut_trend?: number;
  gut_score?: number;

  // Impedimentos e aditivos
  transit_issue_reason?: string;
  is_transit_impeded?: boolean;
  impediment_reason?: string;
  is_execution_impeded?: boolean;
  aditives?: {
    description: string;
    service_id?: string;
  }[];

  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceOrderService {
  private http = inject(HttpClient);
  private url = `${environment.serverUrl}${Strings.API_SERVICE_ORDERS}`;

  getServiceOrders(filters?: { company_id?: string; collaborator_id?: string }): Observable<{ success: boolean; data: ServiceOrder[] }> {
    let query = '';
    if (filters) {
      const params = new URLSearchParams();
      if (filters.company_id) params.append('company_id', filters.company_id);
      if (filters.collaborator_id) params.append('collaborator_id', filters.collaborator_id);
      query = `?${params.toString()}`;
    }
    return this.http.get<{ success: boolean; data: ServiceOrder[] }>(`${this.url}${query}`);
  }

  getServiceOrderById(id: string): Observable<{ success: boolean; data: ServiceOrder }> {
    return this.http.get<{ success: boolean; data: ServiceOrder }>(`${this.url}/${id}`);
  }

  createServiceOrder(data: Partial<ServiceOrder>): Observable<{ success: boolean; data: ServiceOrder }> {
    return this.http.post<{ success: boolean; data: ServiceOrder }>(this.url, data);
  }

  updateServiceOrder(id: string, data: Partial<ServiceOrder>): Observable<{ success: boolean; data: ServiceOrder }> {
    return this.http.put<{ success: boolean; data: ServiceOrder }>(`${this.url}/${id}`, data);
  }

  updateStatus(id: string, status: string, location?: { lat: number, lng: number }): Observable<{ success: boolean; data: ServiceOrder }> {
    return this.http.patch<{ success: boolean; data: ServiceOrder }>(`${this.url}/${id}/status`, { status, location });
  }

  assignTechnician(id: string, collaborator_id: string, scheduled_date?: string): Observable<{ success: boolean; data: ServiceOrder }> {
    return this.http.patch<{ success: boolean; data: ServiceOrder }>(`${this.url}/${id}/assign-technician`, { collaborator_id, scheduled_date });
  }

  acceptSchedule(id: string): Observable<{ success: boolean; data: ServiceOrder }> {
    return this.http.patch<{ success: boolean; data: ServiceOrder }>(`${this.url}/${id}/accept-schedule`, {});
  }

  proposeSchedule(id: string, new_date: string): Observable<{ success: boolean; data: ServiceOrder }> {
    return this.http.patch<{ success: boolean; data: ServiceOrder }>(`${this.url}/${id}/propose-schedule`, { new_date });
  }

  cancelOrder(id: string, reason?: string): Observable<{ success: boolean; data: ServiceOrder }> {
    return this.http.patch<{ success: boolean; data: ServiceOrder }>(`${this.url}/${id}/cancel`, { reason });
  }

  reportTransitIssue(id: string, reason: string): Observable<{ success: boolean; data: ServiceOrder }> {
    return this.http.patch<{ success: boolean; data: ServiceOrder }>(`${this.url}/${id}/transit-issue`, { reason });
  }

  resolveTransitIssue(id: string): Observable<{ success: boolean; data: ServiceOrder }> {
    return this.http.patch<{ success: boolean; data: ServiceOrder }>(`${this.url}/${id}/transit-resolve`, {});
  }

  reportExecutionImpediment(id: string, reason: string): Observable<{ success: boolean; data: ServiceOrder }> {
    return this.http.patch<{ success: boolean; data: ServiceOrder }>(`${this.url}/${id}/impediment`, { reason });
  }

  addAditive(id: string, aditive: { description: string; service_id?: string }): Observable<{ success: boolean; data: ServiceOrder }> {
    return this.http.post<{ success: boolean; data: ServiceOrder }>(`${this.url}/${id}/aditive`, aditive);
  }

  checkoutOrder(id: string, report: { notes: string; observations: string; images_url?: string[] }): Observable<{ success: boolean; data: ServiceOrder }> {
    return this.http.patch<{ success: boolean; data: ServiceOrder }>(`${this.url}/${id}/checkout`, report);
  }

  evaluateOrder(id: string, evaluation: { follower_signature: string; stars?: number; comment?: string }): Observable<{ success: boolean; data: ServiceOrder }> {
    return this.http.patch<{ success: boolean; data: ServiceOrder }>(`${this.url}/${id}/evaluate`, evaluation);
  }
}
