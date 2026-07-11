# Padrão de Criação de Services (Angular + Promises/Async-Await)

Sempre crie os serviços de comunicação de API do ecossistema Angular do aplicativo seguindo estritamente as regras arquiteturais abaixo:

## Regras de Estrutura do Arquivo (.ts)
1. **Injeção de Dependência Moderna**: Proibido injetar via construtor. Utilize exclusivamente a função `inject(ApiService)` de forma privada para herdar o manipulador de requisições.
2. **Abstração RxJS para Promise**: O projeto utiliza um ecossistema assíncrono baseado em Promises no fluxo principal. Sempre envolva as chamadas HTTP do `ApiService` usando o operador de descarte `lastValueFrom()` da biblioteca `rxjs`.
3. **Gerenciamento de Endpoints Unificados**: Nunca escreva URLs literais de endpoints nos métodos. Utilize mapeamentos centralizados provenientes do Enum de strings do sistema (ex: `Strings.API_PLANS`, `Strings.API_RATINGS`).
4. **Instanciação com Métodos de Fábrica (Instanciação de Model)**: Toda resposta de API que devolva entidades de negócio deve sofrer uma conversão segura para a sua classe de domínio correspondente utilizando o método estático `.fromJson()`.

## Exemplo de Referência Completo
```typescript
import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { lastValueFrom } from 'rxjs';
import { Entidade } from '../../models/entidade.model';
import { Strings } from '../../enum/strings';

@Injectable({
  providedIn: 'root'
})
export class ExemploService {
  private api = inject(ApiService);

  async getAll(): Promise<Entidade[]> {
    const response: any = await lastValueFrom(this.api.get(Strings.API_EXEMPLO));
    const data = response?.data || response;
    return (Array.isArray(data) ? data : []).map((item: any) => Entidade.fromJson(item));
  }

  async create(payload: any): Promise<Entidade> {
    const response = await lastValueFrom(this.api.post(`${Strings.API_EXEMPLO}/create`, payload));
    return Entidade.fromJson(response?.data || response);
  }
}
```
