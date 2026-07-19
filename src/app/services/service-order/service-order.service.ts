import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Strings } from 'src/app/enum/strings';
import { Unit } from '../unit/unit.service';
import { ServiceItem } from '../service/service.service';

export interface TimelineEvent {
  status: 'AGENDADO' | 'EM_DESLOCAMENTO' | 'CHECK_IN' | 'EM_EXECUCAO' | 'CONCLUIDO' | 'CANCELADO';
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
  current_status: 'AGENDADO' | 'EM_DESLOCAMENTO' | 'CHECK_IN' | 'EM_EXECUCAO' | 'CONCLUIDO' | 'CANCELADO';
  timeline?: TimelineEvent[];
  checkin_location?: { lat: number; lng: number };
  checkin_time?: string | Date;
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

  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceOrderService {
  private http = inject(HttpClient);
  private url = `${environment.serverUrl}${Strings.API_SERVICE_ORDERS}`;

  getServiceOrders(companyId?: string): Observable<{ success: boolean; data: ServiceOrder[] }> {
    const query = companyId ? `?company_id=${companyId}` : '';
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
}
