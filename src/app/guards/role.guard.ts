import { inject } from '@angular/core';
import { Router, Route, UrlSegment, CanMatchFn } from '@angular/router';
import { ProfileService } from '../services/profile/profile.service';
import { GlobalService } from '../services/global/global.service';
import { Strings } from '../enum/strings';

/**
 * Guard para validar o tipo de perfil (Role) do usuário antes de carregar a rota.
 */
export const roleGuard: CanMatchFn = async (route: Route, segments: UrlSegment[]) => {
  const profileService = inject(ProfileService);
  const router = inject(Router);
  const global = inject(GlobalService);

  // Obtém o cargo esperado definido na configuração da rota (data.role)
  const expectedRole = route.data?.['role'];
  
  try {
    console.log(`[RoleGuard] Verificando acesso para: ${expectedRole}`);
    const profile = await profileService.getProfile();
    
    if (profile && (profile.type === expectedRole || (expectedRole === Strings.SUPER_TYPE && profile.type === 'super_staff'))) {
      return true;
    }

    // Se o usuário estiver logado mas o cargo não for o esperado
    if (profile) {
      global.errorToast('Acesso Negado: Você não possui permissão para acessar esta área.');
      if (profile.type === Strings.SUPER_TYPE || profile.type === 'super_staff') {
        router.navigate(['/super-admin']);
      } else if (profile.type === Strings.COMPANY_OWNER_TYPE) {
        router.navigate(['/company']);
      } else if (profile.type === Strings.COLLABORATOR_TYPE) {
        router.navigate(['/collaborator']);
      } else {
        router.navigate(['/customer']);
      }
    } else {
      router.navigate(['/login']);
    }
    return false;
  } catch (error) {
    console.error('[RoleGuard] Erro ao obter perfil ou conexão recusada:', error);
    return router.parseUrl('/login');
  }
};
