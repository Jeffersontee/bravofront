import { GlobalService } from './../global/global.service';
import { switchMap, take, catchError, filter, retry, tap } from 'rxjs/operators';
import { AuthService } from "../auth/auth.service";
import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest, HttpInterceptorFn } from "@angular/common/http";
import { Observable, throwError, timer } from "rxjs";
import { environment } from "src/environments/environment";
import { inject } from "@angular/core";
import { Router } from '@angular/router';

export const TokenInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const auth = inject(AuthService);
  const global = inject(GlobalService);
  const router = inject(Router);

  // Saneamento da URL para remover barras duplas (ex: http://api.com//user -> http://api.com/user)
  // Dividimos pelo protocolo para não quebrar o "://"
  let sanitizedUrl = req.url;
  if (sanitizedUrl.includes('://')) {
    const parts = sanitizedUrl.split('://');
    parts[1] = parts[1].replace(/\/+/g, '/');
    sanitizedUrl = parts.join('://');
  } else {
    sanitizedUrl = sanitizedUrl.replace(/\/+/g, '/');
  }
  const sanitizedReq = req.clone({ url: sanitizedUrl });

  // Lê o token atual do Signal de forma síncrona
  const currentToken = auth.token();
  return next(addAuthHeader(sanitizedReq, currentToken)).pipe(
    tap(() => console.log(`[Interceptor] Request to ${sanitizedReq.url} with token: ${currentToken ? 'present' : 'absent'}`)),
        // Mecanismo de Retry para falhas de rede ou servidor
        retry({
          count: 2, // Tenta 2 vezes antes de desistir
          delay: (error, retryCount) => {
            // NÃO tenta retry em erros de autenticação (401/403) ou erros de cliente (4xx)
            if (error.status === 401 || error.status === 403 || (error.status >= 400 && error.status < 500)) {
              throw error; 
            }
            console.warn(`⚠️ [RETRY]: Tentativa ${retryCount} para ${sanitizedReq.url} devido ao erro ${error.status}`);
            return timer(retryCount * 1000); // Espera 1s na primeira, 2s na segunda
          }
        }),
        catchError(err => {
          console.log('catcherror err: ', err);
          if (err instanceof HttpErrorResponse && err.status === 401) {
            // Verifica se há um refresh token disponível e se já não estamos em processo de refresh
            const currentRefreshToken = auth.refreshToken();
            console.log('currentRefreshToken: ', currentRefreshToken);

            // Se houver refresh token e não estivermos refrescando, iniciamos o processo
            if (currentRefreshToken && !auth.isRefreshingToken()) {
              // Chama a API de refresh token
              return callRefreshTokenApi(auth, global, sanitizedReq, next);
            } else if (currentRefreshToken && auth.isRefreshingToken()) {
              // Se o refresh já estiver em andamento, espera pelo novo token
              return auth.accessTokenSubject.pipe(
                filter(token => token !== null), // Espera até que um novo token seja emitido (ou null em caso de falha)
                take(1),
                switchMap(token => next(addAuthHeader(sanitizedReq, token)))
              );
            }
            return logout(auth, global, err);
          }
          // In case of 403 http error (refresh token failed)
        if (err instanceof HttpErrorResponse && (err.status === 403 || err.status === 402)) {
          const errorMsg = err.error?.message || '';
          // Verifica se a mensagem de erro refere-se a limites ou upgrade
          if (errorMsg.includes('Limite') || errorMsg.includes('upgrade') || err.status === 402) {
            global.showAlert(errorMsg || 'Limite do plano atingido. Faça um upgrade para continuar.');
            router.navigateByUrl('/establishment-admin/subscriptions');
            return throwError(() => err);
          }
        }

          if(err instanceof HttpErrorResponse && err.status === 403) {
            // Se o erro vier de uma busca de item (getItem), não deslogamos o usuário.
            // Deixamos o erro passar para que o CartService trate (ex: avisar que o produto sumiu).
            if (err.url && err.url.includes('/api/items/getItem/')) {
              return throwError(() => err);
            }

            // logout
            return logout(auth, global, err);
          }
          if (err instanceof HttpErrorResponse && err.status === 0) {
            console.error('❌ [NETWORK ERROR]: Falha de conexão com o backend.', err);
            global.errorToast('Falha de conexão com o servidor. Verifique se o backend está rodando e se o CORS permite esta origem.');
          }
          return throwError(() => err);
        })
  );
}

const addAuthHeader = (req: HttpRequest<any>, token: string | null | undefined): HttpRequest<any> => {
  const isApiUrl = req.url.startsWith(environment.serverUrl);
  // Evita enviar header Authorization para a rota de refresh (evita 403 por token expirado no header)
  const isRefreshRoute = req.url.includes('/users/refresh_token');
  if(token && isApiUrl && !isRefreshRoute) {
    return req.clone({ // Garante que o token não seja undefined
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return req;
}

const callRefreshTokenApi = (auth: AuthService, global: GlobalService, req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  // Define que o refresh está em andamento para bloquear outras requisições
  auth.isRefreshingToken.set(true);
  auth.accessTokenSubject.next(null); // Limpa o token anterior para requisições em espera

  return auth.getNewTokens().pipe( // auth.getNewTokens() deve retornar um Observable
      switchMap((response: any) => {
        auth.isRefreshingToken.set(false);
        auth.accessTokenSubject.next(response.data?.token); // Notifica as requisições em espera
        // Repete a requisição original com o novo token
        return next(addAuthHeader(req, response.data?.token));
      }),
      catchError(e => {
        console.error('❌ [AUTH AUDIT]: Falha crítica na renovação do token.', {
          status: e.status,
          message: e.error?.message || e.message,
          url: req.url,
          details: e // Log do erro completo para depuração
        });
        auth.isRefreshingToken.set(false);
        auth.accessTokenSubject.next(null); // Garante que requisições em espera não recebam um token inválido
        // Desloga o usuário se o refresh token falhar
        return logout(auth, global, e);
      })
  );
}

const logout = (auth: AuthService, global: GlobalService, error: any): Observable<HttpEvent<any>> => {
  const errorMsg = error?.error?.message || 'Sessão expirada ou inválida.';
  console.warn('⚠️ [AUTH AUDIT]: Finalizando sessão devido a erro de autorização:', errorMsg);
  auth.logoutUser();
  global.stopToast();
  global.showAlert(errorMsg);
  return throwError(() => error);
};