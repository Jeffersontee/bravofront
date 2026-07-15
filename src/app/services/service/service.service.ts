import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Strings } from '../../enum/strings';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface ServiceItem {
  _id?: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private http = inject(HttpClient);
  private url = `${environment.serverUrl}${Strings.API_SERVICES}`;

  getHeaders() {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getServices(): Observable<{ success: boolean; data: ServiceItem[] }> {
    return this.http.get<{ success: boolean; data: ServiceItem[] }>(this.url, { headers: this.getHeaders() });
  }

  createService(data: Partial<ServiceItem>): Observable<{ success: boolean; data: ServiceItem }> {
    return this.http.post<{ success: boolean; data: ServiceItem }>(this.url, data, { headers: this.getHeaders() });
  }

  updateService(id: string, data: Partial<ServiceItem>): Observable<{ success: boolean; data: ServiceItem }> {
    return this.http.put<{ success: boolean; data: ServiceItem }>(`${this.url}/${id}`, data, { headers: this.getHeaders() });
  }

  deleteService(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.url}/${id}`, { headers: this.getHeaders() });
  }
}
