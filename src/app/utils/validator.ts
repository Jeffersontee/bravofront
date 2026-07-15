// src/app/utils/validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  // Padrões Regex (Estáticos para reuso)
  static readonly emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
  static readonly phonePattern = /^\d{10,11}$/; // Aceita 10 ou 11 dígitos
  static readonly cnpjPattern = /^\d{14}$/;

  /**
   * Exemplo de Validador Customizado: Compara dois campos (ex: Senha e Confirmação)
   */
  static matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return !!control.parent &&
        !!control.parent.value &&
        control.value === control.parent.get(matchTo)?.value
        ? null
        : { isMatching: false };
    };
  }
}
