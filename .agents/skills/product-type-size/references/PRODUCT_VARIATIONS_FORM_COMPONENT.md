# Reference: Frontend Variations Form Component

Exemplo de implementação em Angular de um formulário que gerencia a reatividade entre Tipos e Tamanhos, utilizando `FormArray` para as variações e mapeando o payload final no `onSubmit`.

## 🧬 Componente TypeScript (.ts)

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/standalone';

@Component({
  selector: 'app-product-variations-form',
  templateUrl: './product-variations-form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule]
})
export class ProductVariationsFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  productForm!: FormGroup;
  types = signal<any[]>([]); // Carregado da API (ex: [{ _id: '1', name: 'Lata' }])
  sizes = signal<any[]>([]); // Carregado da API (ex: [{ _id: '10', type_id: '1', name: '350ml' }])

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      variations: this.fb.array([])
    });
  }

  get variations(): FormArray {
    return this.productForm.get('variations') as FormArray;
  }

  /**
   * Adiciona uma nova linha de variação
   */
  addVariation() {
    const variationGroup = this.fb.group({
      type_id: ['', Validators.required],
      size_id: ['', Validators.required],
      sale_price: [0, Validators.required],
      cost_price:,
      stock: [0, Validators.required],
      sku: ['']
    });

    // Sincronização de Combos Dependentes (Rule 2)
    variationGroup.get('type_id')?.valueChanges.subscribe(() => {
      // Reset Imediato do campo filho ao mudar o pai
      variationGroup.get('size_id')?.setValue('', { emitEvent: false });
    });

    this.variations.push(variationGroup);
  }

  /**
   * Filtra os tamanhos disponíveis para uma linha específica com base no Tipo selecionado
   */
  getFilteredSizes(index: number): any[] {
    const typeId = this.variations.at(index).get('type_id')?.value;
    const idStr = typeId && typeof typeId === 'object' ? typeId._id : typeId;
    return this.sizes().filter(size => size.type_id === idStr);
  }

  /**
   * Comparador para o ion-select não ficar em branco caso o backend retorne objeto completo
   */
  compareWith(currentValue: any, compareValue: any): boolean {
    if (!currentValue || !compareValue) return false;
    const id1 = typeof currentValue === 'object' ? currentValue._id : currentValue;
    const id2 = typeof compareValue === 'object' ? compareValue._id : compareValue;
    return id1 === id2;
  }

  /**
   * Mapeamento de Payload no onSubmit
   */
  onSubmit() {
    if (this.productForm.invalid) return;

    const rawValues = this.productForm.value;
    const primaryVariation = rawValues.variations[0] || {};

    // Copia as chaves da variação primária para a raiz do payload final
    const payload = {
      name: rawValues.name,
      type_id: typeof primaryVariation.type_id === 'object' ? primaryVariation.type_id._id : primaryVariation.type_id,
      size_id: typeof primaryVariation.size_id === 'object' ? primaryVariation.size_id._id : primaryVariation.size_id,
      stock: primaryVariation.stock || 0,
      sku: primaryVariation.sku || '',
      sale_price: primaryVariation.sale_price || 0,
      cost_price: primaryVariation.cost_price || 0,
      variations: rawValues.variations
    };

    console.log('Payload estruturado pronto para envio:', payload);
    // Envia o payload final para o seu Service do backend Node.js...
  }
}
```

## 📐 Template HTML (.html)

```html
<form [formGroup]="productForm" (ngSubmit)="onSubmit()">
  <ion-list>
    <ion-item>
      <ion-input label="Nome do Produto" formControlName="name" type="text"></ion-input>
    </ion-item>

    <div formArrayName="variations">
      <div *ngFor="let item of variations.controls; let i = index" [formGroupName]="i" class="dashedBorderBottom ion-padding">
        <h3>Variação #{{ i + 1 }}</h3>

        <!-- Select do Tipo (Pai) -->
        <ion-item>
          <ion-select label="Tipo" formControlName="type_id" [compareWith]="compareWith">
            <ion-select-option *ngFor="let t of types()" [value]="t._id">{{ t.name }}</ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Select do Tamanho (Filho - Dependente) -->
        <ion-item>
          <ion-select label="Tamanho" formControlName="size_id" [compareWith]="compareWith">
            <ion-select-option *ngFor="let s of getFilteredSizes(i)" [value]="s._id">{{ s.name }}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-input label="Preço de Venda" formControlName="sale_price" type="number"></ion-input>
        </ion-item>
      </div>
    </div>
  </ion-list>

  <ion-button expand="block" (click)="addVariation()">Adicionar Variação</ion-button>
  <ion-button expand="block" type="submit" [disabled]="productForm.invalid">Salvar Produto</ion-button>
</form>
```
