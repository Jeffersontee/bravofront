# Seed Service - Dados Fake para Testes

Serviço para gerar dados fake/mock realistas para desenvolvimento e testes do sistema.

## 📦 Uso Básico

### Importar o serviço

```typescript
import { SeedService } from 'src/app/services/seed/seed.service';

constructor(private seed: SeedService) {}
```

### Gerar métricas simples

```typescript
const metrics = this.seed.generateMetrics();
// Retorna: AnalyticsMetrics com valores aleatórios realistas
```

### Gerar com valores customizados

```typescript
const metrics = this.seed.generateMetrics({
  mrr: 10000,        // Monthly Recurring Revenue
  clients: 100,      // Total de clientes
  churn: 3           // Taxa de churn em %
});
```

### Gerar todos os dados de uma vez

```typescript
const data = this.seed.generateCompleteData();

console.log(data.metrics);           // Métricas principais
console.log(data.revenueChart);      // Gráfico de receita
console.log(data.clientsChart);      // Gráfico de clientes
console.log(data.topClients);        // Top 5 clientes
console.log(data.alerts);            // Alertas do sistema
console.log(data.planStatistics);    // Estatísticas por plano
console.log(data.churnAnalysis);     // Análise de churn
```

## 🎯 Métodos Disponíveis

### `generateMetrics(options?)`
Gera métricas analíticas completas.

**Parâmetros:**
- `options?.mrr` - Monthly Recurring Revenue (padrão: aleatório 5k-50k)
- `options?.clients` - Total de clientes (padrão: aleatório 50-500)
- `options?.churn` - Taxa de churn % (padrão: aleatório 1-8%)

**Retorna:** `AnalyticsMetrics`

### `generateRevenueChart(months?)`
Gera dados de gráfico de receita.

**Parâmetros:**
- `months` - Número de meses (padrão: 12)

**Retorna:** `RevenueChartData`

### `generateClientsChart(months?)`
Gera dados de gráfico de clientes.

**Parâmetros:**
- `months` - Número de meses (padrão: 12)

**Retorna:** `ClientsChartData`

### `generateTopClients(limit?)`
Gera top clientes por receita.

**Parâmetros:**
- `limit` - Número de clientes (padrão: 5)

**Retorna:** `TopClient[]` (ordenado por receita decrescente)

### `generateAlerts(count?)`
Gera alertas do sistema.

**Parâmetros:**
- `count` - Número de alertas (padrão: 5)

**Retorna:** `Alert[]`

### `generatePlanStatistics()`
Gera estatísticas por plano de preço.

**Retorna:** `PlanStatistics[]`

### `generateChurnAnalysis()`
Gera análise de churn do mês atual.

**Retorna:** `ChurnAnalysis`

### `generateCompleteData()`
Gera todos os dados de uma vez.

**Retorna:** Objeto com todas as propriedades acima

## 💡 Exemplos de Uso

### No Dashboard Component

```typescript
// dashboard.page.ts
import { SeedService } from 'src/app/services/seed/seed.service';

export class DashboardPage implements OnInit {
  constructor(
    private analyticsService: AnalyticsService,
    private seed: SeedService
  ) {}

  async loadDashboardData(): Promise<void> {
    try {
      const fakeData = this.seed.generateCompleteData();
      
      // Usar dados fake
      this.metrics = fakeData.metrics;
      this.topClients = fakeData.topClients;
      this.alerts = fakeData.alerts;
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    }
  }
}
```

### No Analytics Service (com fallback para fake data)

```typescript
// analytics.service.ts
constructor(
  private api: TypedApiService,
  private seed: SeedService
) {}

async loadMetrics(): Promise<AnalyticsMetrics> {
  try {
    return await this.api.get<AnalyticsMetrics>('/api/analytics/dashboard');
  } catch (error) {
    console.warn('API indisponível, usando dados fake');
    return this.seed.generateMetrics();
  }
}
```

### Para Testes Unitários

```typescript
// dashboard.spec.ts
describe('DashboardComponent', () => {
  let seed: SeedService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SeedService]
    });
    seed = TestBed.inject(SeedService);
  });

  it('should display metrics correctly', () => {
    const metrics = seed.generateMetrics({
      mrr: 10000,
      clients: 100,
      churn: 2
    });

    expect(metrics.mrr).toBe(10000);
    expect(metrics.total_clients).toBe(100);
    expect(metrics.churn_rate).toBe(2);
  });

  it('should generate realistic top clients', () => {
    const clients = seed.generateTopClients(5);
    
    expect(clients.length).toBe(5);
    expect(clients[0].monthly_revenue).toBeGreaterThanOrEqual(
      clients[4].monthly_revenue
    );
  });
});
```

## 📊 Dados Realistas Inclusos

### Estabelecimentos (Nomes)
- Adega Dom Pérignon
- Vinícola Santa Helena
- Adega Central
- Vinho Premium Store
- Bodega Tradicional
- Casa do Vinho Reservado

### Planos
- **Plano Básico** - R$ 29.99/mês
- **Plano Pro** - R$ 79.99/mês
- **Plano Enterprise** - R$ 199.99/mês

### Status de Assinatura
- `active` - Ativo
- `trial` - Período trial
- `paused` - Pausado
- `cancelled` - Cancelado

### Tipos de Alerta
- `success` - Sucesso
- `warning` - Aviso
- `danger` - Perigo
- `info` - Informação

## 🔧 Customização

Você pode estender o `SeedService` para adicionar mais dados realistas:

```typescript
// seed.service.ts
export class SeedService {
  private readonly CITIES = [
    'São Paulo',
    'Rio de Janeiro',
    'Belo Horizonte',
    'Curitiba',
    'Salvador'
  ];

  generateEstablishment() {
    return {
      name: this.randomElement(this.ESTABLISHMENTS),
      city: this.randomElement(this.CITIES),
      foundedYear: this.randomBetween(1990, 2020)
    };
  }
}
```

## ⚡ Performance

- Todos os métodos são síncronos e instantâneos
- Ideal para testes e desenvolvimento offline
- Dados gerados aleatoriamente a cada chamada
- Sem chamadas HTTP ou I/O

## 🎲 Randomização

Os dados são gerados com valores aleatórios realistas:

- **MRR (Receita)**: R$ 5.000 a R$ 50.000
- **Clientes**: 50 a 500
- **Churn**: 1% a 8%
- **Crescimento**: -15% a +35%
- **LTV**: R$ 500 a R$ 5.000
- **CAC**: R$ 50 a R$ 500
