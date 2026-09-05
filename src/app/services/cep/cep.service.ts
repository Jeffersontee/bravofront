import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CepService {
  private http = inject(HttpClient);

  /**
   * Consulta dados de endereço a partir de um CEP brasileiro (8 dígitos)
   */
  public searchCep(cep: string): Observable<ViaCepResponse | null> {
    if (!cep) return of(null);
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      return of(null);
    }

    const url = `https://viacep.com.br/ws/${cleanCep}/json/`;
    return this.http.get<ViaCepResponse>(url).pipe(
      map(res => {
        if (res && (res.erro as any) === true) {
          return null;
        }
        return res;
      }),
      catchError(err => {
        console.warn('Erro ao consultar ViaCEP:', err);
        return of(null);
      })
    );
  }

  /**
   * Aplica máscara de CEP (00000-000)
   */
  public formatCep(value: string): string {
    if (!value) return '';
    const clean = value.replace(/\D/g, '').substring(0, 8);
    if (clean.length <= 5) return clean;
    return `${clean.substring(0, 5)}-${clean.substring(5)}`;
  }
}
