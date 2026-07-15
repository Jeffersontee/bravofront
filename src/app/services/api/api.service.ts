import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = environment.serverUrl;

  constructor(private http: HttpClient) { }

  get(endpoint: string, params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}${endpoint}`, { params });
  }

  post(endpoint: string, data: any, isFormData: boolean = false): Observable<any> {
    let headers = new HttpHeaders();
    const isFD = isFormData || (typeof FormData !== 'undefined' && data instanceof FormData);
    // Se não for FormData, enviamos como JSON padrão
    if (!isFD) {
      headers = headers.append('Content-Type', 'application/json');
    }
    return this.http.post(`${this.baseUrl}${endpoint}`, data, { headers });
  }

  put(endpoint: string, data: any, isFormData: boolean = false): Observable<any> {
    let headers = new HttpHeaders();
    const isFD = isFormData || (typeof FormData !== 'undefined' && data instanceof FormData);
    if (!isFD) {
      headers = headers.append('Content-Type', 'application/json');
    }
    return this.http.put(`${this.baseUrl}${endpoint}`, data, { headers });
  }

  patch(endpoint: string, data: any, isFormData: boolean = false): Observable<any> {
    let headers = new HttpHeaders();
    const isFD = isFormData || (typeof FormData !== 'undefined' && data instanceof FormData);
    if (!isFD) {
      headers = headers.append('Content-Type', 'application/json');
    }
    return this.http.patch(`${this.baseUrl}${endpoint}`, data, { headers });
  }

  delete(endpoint: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${endpoint}`);
  }
}