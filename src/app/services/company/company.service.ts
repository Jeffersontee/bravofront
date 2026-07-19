import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Strings } from '../../enum/strings';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface Company {
  _id?: string;
  name: string;
  owner_name?: string;
  short_name?: string;
  description?: string;
  cnpj: string;
  email?: string;
  active: boolean;
  services?: string[];
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private http = inject(HttpClient);
  private url = `${environment.serverUrl}${Strings.API_COMPANIES}`;

  getHeaders() {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getCompanies(): Observable<{ success: boolean; data: Company[] }> {
    return this.http.get<{ success: boolean; data: Company[] }>(this.url, { headers: this.getHeaders() });
  }

  getCompanyById(id: string): Observable<{ success: boolean; data: Company }> {
    return this.http.get<{ success: boolean; data: Company }>(`${this.url}/${id}`, { headers: this.getHeaders() });
  }

  createCompany(data: Partial<Company>): Observable<{ success: boolean; data: Company }> {
    return this.http.post<{ success: boolean; data: Company }>(this.url, data, { headers: this.getHeaders() });
  }

  updateCompany(id: string, data: Partial<Company>): Observable<{ success: boolean; data: Company }> {
    return this.http.put<{ success: boolean; data: Company }>(`${this.url}/${id}`, data, { headers: this.getHeaders() });
  }

  updateCompanyServices(id: string, services: string[]): Observable<{ success: boolean; data: Company }> {
    return this.http.patch<{ success: boolean; data: Company }>(`${this.url}/${id}/services`, { services }, { headers: this.getHeaders() });
  }

  deleteCompany(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.url}/${id}`, { headers: this.getHeaders() });
  }

  // Usuários vinculados
  getCompanyUsers(id: string): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.url}/${id}/users`, { headers: this.getHeaders() });
  }

  assignUser(id: string, data: any): Observable<{ success: boolean; data: any }> {
    return this.http.post<{ success: boolean; data: any }>(`${this.url}/${id}/users`, data, { headers: this.getHeaders() });
  }

  removeUser(id: string, userId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.url}/${id}/users/${userId}`, { headers: this.getHeaders() });
  }
}
