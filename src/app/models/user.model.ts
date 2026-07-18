import { Strings } from 'src/app/enum/strings';
import { OAuthProvider } from './oauth-token.model';

export interface IUserOAuthProvider {
  provider: OAuthProvider;
  provider_user_id: string;
  linked_at: Date;
  is_primary: boolean;
}

export class User {
  constructor(
    public email: string,
    public _id?: string,
    public phone?: string,
    public name?: string,
    public type?: Strings.USER_TYPE | Strings.ADMIN_TYPE | Strings.SUPER_TYPE | Strings.STAFF_TYPE | Strings.SUPER_STAFF_TYPE | Strings.COLLABORATOR_TYPE,
    public status?: string,
    public email_verified?: boolean,
    public photo?: string,
    public subscription_status?: string,
    public company_id?: string, // Novo campo sincronizado com o Backend
    public oauth_providers: IUserOAuthProvider[] = [], // Lista de vínculos OAuth
    public cpf?: string,
    public cnpj?: string,
    public next_payment_date?: string | Date,
    public role?: string,
    public permissions: string[] = []
  ) {}

  // Mapeia os dados da API com segurança total
  static fromJson(data: any): User {
    return new User(
      data.email,
      data._id || data.id,
      data.phone,
      data.name,
      data.type,
      data.status,
      data.email_verified,
      data.photo,
      data.subscription_status,
      data.company_id, // Mapeamento do novo campo
      data.oauth_providers ? data.oauth_providers.map((p: any) => ({
        ...p,
        linked_at: p.linked_at ? new Date(p.linked_at) : new Date()
      })) : [],
      data.cpf,
      data.cnpj,
      data.next_payment_date,
      data.role || null,
      data.permissions || []
    );
  }

  hasProvider(provider: OAuthProvider): boolean {
    return this.oauth_providers.some(p => p.provider === provider);
  }
}  
