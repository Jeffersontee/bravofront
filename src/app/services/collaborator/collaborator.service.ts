import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface Collaborator {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  company_id?: any;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CollaboratorService {
  private http = inject(HttpClient);
  private url = `${environment.serverUrl}collaborators`;

  getCollaborators(): Observable<{ success: boolean; data: Collaborator[] }> {
    return this.http.get<{ success: boolean; data: Collaborator[] }>(this.url);
  }

  getCollaboratorById(id: string): Observable<{ success: boolean; data: Collaborator }> {
    return this.http.get<{ success: boolean; data: Collaborator }>(`${this.url}/${id}`);
  }

  createCollaborator(data: Partial<Collaborator>): Observable<{ success: boolean; data: Collaborator }> {
    return this.http.post<{ success: boolean; data: Collaborator }>(this.url, data);
  }

  updateCollaborator(id: string, data: Partial<Collaborator>): Observable<{ success: boolean; data: Collaborator }> {
    return this.http.put<{ success: boolean; data: Collaborator }>(`${this.url}/${id}`, data);
  }

  deleteCollaborator(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.url}/${id}`);
  }
}
