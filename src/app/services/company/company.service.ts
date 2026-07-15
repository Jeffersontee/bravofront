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

  createCompany(data: Partial<Company>): Observable<{ success: boolean; data: Company }> {
    return this.http.post<{ success: boolean; data: Company }>(this.url, data, { headers: this.getHeaders() });
  }

  updateCompany(id: string, data: Partial<Company>): Observable<{ success: boolean; data: Company }> {
    return this.http.put<{ success: boolean; data: Company }>(`${this.url}/${id}`, data, { headers: this.getHeaders() });
  }

  deleteCompany(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.url}/${id}`, { headers: this.getHeaders() });
  }
}
