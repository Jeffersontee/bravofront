# Reference: Reatividade Avançada e Injeção Moderna

Padronize a arquitetura TypeScript eliminando injeções verbosas em construtores e gerenciamentos de estado imperativos.

## Diretrizes de Refatoração

### 1. Injeção de Dependências
* **Evitar:** `constructor(private apiService: ApiService) {}`
* **Adotar:** `private apiService = inject(ApiService);` diretamente no corpo da classe.

### 2. Gerenciamento de Estado Reativo
* **Evitar:** Uso excessivo de variáveis primitivas mutáveis acopladas com detecção manual de mudanças (`ChangeDetectorRef.detectChanges()`).
* **Adotar:** **Angular Signals** (`signal()`, `computed()`) para reatividade síncrona local de componentes.
* **RxJS Boundary:** Mantenha o uso de Streams RxJS (`Observables`, `Subject`) estritamente restrito a fluxos de dados assíncronos complexos, requisições HTTP oriundas de serviços e eventos globais.
