import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface StaffUser {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  type: string;
  status: string;
  company_id?: any;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private http = inject(HttpClient);
  private url = `${environment.serverUrl}users/staff`;

  getStaffList(): Observable<{ success: boolean; data: StaffUser[] }> {
    return this.http.get<{ success: boolean; data: StaffUser[] }>(this.url);
  }

  getStaffById(id: string): Observable<{ success: boolean; data: StaffUser }> {
    return this.http.get<{ success: boolean; data: StaffUser }>(`${this.url}/${id}`);
  }

  createStaff(data: Partial<StaffUser>): Observable<{ success: boolean; data: StaffUser }> {
    return this.http.post<{ success: boolean; data: StaffUser }>(this.url, data);
  }

  updateStaff(id: string, data: Partial<StaffUser>): Observable<{ success: boolean; data: StaffUser }> {
    return this.http.patch<{ success: boolean; data: StaffUser }>(`${this.url}/${id}`, data);
  }

  deleteStaff(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.url}/${id}`);
  }
}
