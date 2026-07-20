import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { Strings } from '../enum/strings';

/**
 * Guard para impedir que um Lojista acesse dados de outra empresa via URL (Isolamento de Tenant).
 */
export const companyOwnerGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = await authService.getUser(); 

  if (!user) {
    return router.parseUrl(Strings.LOGIN);
  }

  // Regra 1: Super Admin sempre tem acesso total
  if (user.type === Strings.SUPER_TYPE || user.type === 'super_staff') {
    return true;
  }

  // Recuperamos o ID da empresa/estabelecimento da rota
  const requestedId = route.paramMap.get('id') || route.parent?.paramMap.get('id');

  // Regra 2: Se for um Lojista, o ID solicitado na URL DEVE ser o dele
  if (user.type === Strings.COMPANY_OWNER_TYPE) {
    if (requestedId && user.company_id !== requestedId) {
      console.warn(`[Security] Acesso negado: Lojista ${user._id} tentou acessar empresa ${requestedId}`);
      return router.parseUrl('/company');
    }
  }

  return true;
};
