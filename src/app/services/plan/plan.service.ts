import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface Plan {
  _id?: string;
  name: string;
  code?: string;
  description?: string;
  price: number;
  billing_cycle: 'monthly' | 'quarterly' | 'semiannual' | 'yearly';
  max_services: number;
  allowed_services?: string[];
  max_units: number;
  max_users: number;
  catalog_module_enabled: boolean;
  status: 'active' | 'inactive';
  features?: string[];
  total_subscribers?: number;
}

export interface Subscription {
  id?: string;
  _id?: string;
  company_id: any;
  company_name?: string;
  plan_id?: any;
  plan_name?: string;
  amount?: number;
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'unpaid';
  current_period_start?: string | Date;
  current_period_end?: string | Date;
}

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private http = inject(HttpClient);
  private planUrl = `${environment.serverUrl}plans`;
  private subUrl = `${environment.serverUrl}subscriptions`;

  private getHeaders() {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getPlans(): Observable<{ success: boolean; data: Plan[] }> {
    return this.http.get<{ success: boolean; data: Plan[] }>(this.planUrl, { headers: this.getHeaders() });
  }

  getPlanById(id: string): Observable<{ success: boolean; data: Plan }> {
    return this.http.get<{ success: boolean; data: Plan }>(`${this.planUrl}/${id}`, { headers: this.getHeaders() });
  }

  createPlan(data: Partial<Plan>): Observable<{ success: boolean; data: Plan }> {
    return this.http.post<{ success: boolean; data: Plan }>(this.planUrl, data, { headers: this.getHeaders() });
  }

  updatePlan(id: string, data: Partial<Plan>): Observable<{ success: boolean; data: Plan }> {
    return this.http.put<{ success: boolean; data: Plan }>(`${this.planUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  deletePlan(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.planUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Subscriptions
  getSubscriptions(params?: any): Observable<{ success: boolean; data: Subscription[] }> {
    return this.http.get<{ success: boolean; data: Subscription[] }>(this.subUrl, {
      headers: this.getHeaders(),
      params: params || {}
    });
  }

  getSubscriptionById(id: string): Observable<{ success: boolean; data: Subscription }> {
    return this.http.get<{ success: boolean; data: Subscription }>(`${this.subUrl}/${id}`, { headers: this.getHeaders() });
  }

  createCheckoutSession(payload: { planId: string; name?: string; email?: string; cpf?: string }): Observable<any> {
    return this.http.post<any>(`${this.subUrl}/checkout`, payload, { headers: this.getHeaders() });
  }

  renewPix(subscriptionId: string, payload: { company_id?: string; cpf?: string }): Observable<any> {
    return this.http.post<any>(`${this.planUrl}/${subscriptionId}/renew-pix`, payload, { headers: this.getHeaders() });
  }
}
