# Reference: Unit Testing for Variations Form

Arquivo de referência para a suíte de testes unitários que valida as regras de sincronização e o payload de saída.

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProductVariationsFormComponent } from "./product-variations-form.component";
import { ReactiveFormsModule } from "@angular/forms";

describe("ProductVariationsFormComponent", () => {
  let component: ProductVariationsFormComponent;
  let fixture: ComponentFixture<ProductVariationsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ProductVariationsFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductVariationsFormComponent);
    component = fixture.componentInstance;

    // Alimenta os Signals com dados simulados (Mock)
    component.types.set([
      { _id: "type_lata", name: "Lata" },
      { _id: "type_garrafa", name: "Garrafa" },
    ]);
    component.sizes.set([
      { _id: "sz_350", type_id: "type_lata", name: "350ml" },
      { _id: "sz_600", type_id: "type_garrafa", name: "600ml" },
    ]);

    fixture.detectChanges();
  });

  it("deve dar reset imediato no campo filho (size_id) quando o tipo mudar", () => {
    component.addVariation();
    const variationGroup = component.variations.at(0);

    // Força uma seleção inicial de Tipo e Tamanho
    variationGroup.get("type_id")?.setValue("type_lata");
    variationGroup.get("size_id")?.setValue("sz_350");

    // Modifica o tipo pai
    variationGroup.get("type_id")?.setValue("type_garrafa");

    // Valida a regra de Reset Imediato (Rule 2)
    expect(variationGroup.get("size_id")?.value).toBe("");
  });
});
```
