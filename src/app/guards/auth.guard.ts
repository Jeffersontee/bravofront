import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProfileService } from '../services/profile/profile.service';
import { Strings } from '../enum/strings';

/**
 * Guard para garantir que o usuário está devidamente autenticado (qualquer cargo).
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const profileService = inject(ProfileService);
  const router = inject(Router);

  try {
    const profile = await profileService.getProfile();
    if (profile) {
      return true;
    }
    return router.parseUrl(Strings.LOGIN);
  } catch (error) {
    console.error('[AuthGuard] Usuário não autenticado ou token inválido:', error);
    return router.parseUrl(Strings.LOGIN);
  }
};
