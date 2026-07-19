import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Strings } from 'src/app/enum/strings';
import { Collaborator } from '../collaborator/collaborator.service';

export interface UnitAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
  lat?: number;
  lng?: number;
}

export interface Unit {
  _id?: string;
  name: string;
  company_id: string;
  address: UnitAddress;
  manager_id?: Collaborator;
  follower_ids?: Collaborator[];
  status: 'ACTIVE' | 'INACTIVE';
  cnpj?: string;
  phone?: string;
  email?: string;
  short_name?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private http = inject(HttpClient);
  private url = `${environment.serverUrl}${Strings.API_UNITS}`;

  getHeaders() {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getUnits(companyId?: string): Observable<{ success: boolean; data: Unit[] }> {
    let requestUrl = this.url;
    if (companyId) {
      requestUrl = `${this.url}?company_id=${companyId}`;
    }
    return this.http.get<{ success: boolean; data: Unit[] }>(requestUrl, { headers: this.getHeaders() });
  }

  getUnitById(id: string): Observable<{ success: boolean; data: Unit }> {
    return this.http.get<{ success: boolean; data: Unit }>(`${this.url}/${id}`, { headers: this.getHeaders() });
  }

  createUnit(data: Partial<Unit>): Observable<{ success: boolean; data: Unit }> {
    return this.http.post<{ success: boolean; data: Unit }>(this.url, data, { headers: this.getHeaders() });
  }

  updateUnit(id: string, data: Partial<Unit>): Observable<{ success: boolean; data: Unit }> {
    return this.http.put<{ success: boolean; data: Unit }>(`${this.url}/${id}`, data, { headers: this.getHeaders() });
  }

  deleteUnit(id: string): Observable<{ success: boolean; data: any }> {
    return this.http.delete<{ success: boolean; data: any }>(`${this.url}/${id}`, { headers: this.getHeaders() });
  }
}
