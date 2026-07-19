import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Strings } from '../../enum/strings';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface DashboardKpis {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  canceledOrders: number;
}

export interface OrdersByMonth {
  _id: { year: number; month: number };
  total: number;
  completed: number;
}

export interface AggregationItem {
  _id: string;
  count: number;
}

export interface DashboardCharts {
  ordersByMonth: OrdersByMonth[];
  companiesBySubscription: AggregationItem[];
  ordersByStatus: AggregationItem[];
}

export interface DashboardStats {
  kpis: DashboardKpis;
  charts: DashboardCharts;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private url = `${environment.serverUrl}${Strings.API_DASHBOARD}`;

  getHeaders() {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getStats(): Observable<{ success: boolean; data: DashboardStats }> {
    return this.http.get<{ success: boolean; data: DashboardStats }>(this.url, { headers: this.getHeaders() });
  }
}
