# 🌱 Seed Service - Quick Start

Gerador rápido de dados fake para testes do dashboard.

## 🚀 50 Segundos - Quick Start

### 1. Importar no Component

```typescript
import { SeedService } from 'src/app/services/seed/seed.service';

constructor(private seed: SeedService) {}
```

### 2. Gerar Dados

```typescript
// Uma linha - Todos os dados
const data = this.seed.generateCompleteData();

// Métricas só
const metrics = this.seed.generateMetrics();

// Com customização
const metrics = this.seed.generateMetrics({
  mrr: 10000,
  clients: 100,
  churn: 3
});
```

### 3. Usar no Template

```typescript
// dashboard.page.ts
async loadDashboardData(): Promise<void> {
  const data = this.seed.generateCompleteData();
  this.metrics = data.metrics;
  this.topClients = data.topClients;
  this.alerts = data.alerts;
}
```

## 📊 O Que Gera?

```
generateCompleteData() retorna:
├── metrics              → Receita, clientes, churn, etc
├── revenueChart        → Gráfico 12 meses
├── clientsChart        → Gráfico cliente
├── topClients          → Top 5 clientes
├── alerts              → 5 alertas
├── planStatistics      → Por plano
└── churnAnalysis       → Análise mensal
```

## 🎯 Todos os Métodos

| Método | Retorna | Exemplo |
|--------|---------|---------|
| `generateMetrics()` | AnalyticsMetrics | `{ mrr: 25000, arr: 300000, ... }` |
| `generateRevenueChart(12)` | RevenueChartData | `{ labels: [...], data: [...] }` |
| `generateClientsChart(12)` | ClientsChartData | `{ labels: [...], active, inactive, new }` |
| `generateTopClients(5)` | TopClient[] | `[{ name, revenue, ... }, ...]` |
| `generateAlerts(5)` | Alert[] | `[{ type, title, message }, ...]` |
| `generatePlanStatistics()` | PlanStatistics[] | `[{ name, subscribers, mrr }, ...]` |
| `generateChurnAnalysis()` | ChurnAnalysis | `{ month, count, reasons }` |
| `generateCompleteData()` | Tudo acima | Combine tudo |

## 💡 Exemplos Reais

### Exemplo 1: Dashboard com Dados Fake

```typescript
// dashboard.page.ts
export class DashboardPage implements OnInit {
  metrics: AnalyticsMetrics | null = null;
  topClients: TopClient[] = [];
  alerts: Alert[] = [];

  constructor(private seed: SeedService) {}

  ngOnInit() {
    this.loadFakeData();
  }

  loadFakeData() {
    const fakeData = this.seed.generateCompleteData();
    this.metrics = fakeData.metrics;
    this.topClients = fakeData.topClients;
    this.alerts = fakeData.alerts;
  }
}
```

### Exemplo 2: API com Fallback

```typescript
// analytics.service.ts
async loadMetrics(): Promise<AnalyticsMetrics> {
  try {
    return await this.api.get('/api/analytics/dashboard');
  } catch (error) {
    console.warn('API down, using fake data');
    return this.seed.generateMetrics();
  }
}
```

### Exemplo 3: Testes Unitários

```typescript
// dashboard.spec.ts
it('shows metrics correctly', () => {
  const metrics = seed.generateMetrics({ mrr: 25000 });
  expect(metrics.mrr).toBe(25000);
});
```

### Exemplo 4: Gráfico de Receita com Chart.js

```typescript
// dashboard.component.ts
loadCharts() {
  const revenue = this.seed.generateRevenueChart(12);
  
  this.revenueChart = new Chart(this.ctx, {
    type: 'line',
    data: {
      labels: revenue.labels,
      datasets: [{
        label: 'Receita',
        data: revenue.data
      }]
    }
  });
}
```

## ⚙️ Customizações

```typescript
// Gerar 100 clientes super ativos, sem churn
const metrics = this.seed.generateMetrics({
  mrr: 50000,
  clients: 100,
  churn: 0
});

// Gerar top 10 clientes em vez de 5
const topClients = this.seed.generateTopClients(10);

// Gerar 2 anos de histórico (24 meses)
const revenue = this.seed.generateRevenueChart(24);

// Gerar 20 alertas em vez de 5
const alerts = this.seed.generateAlerts(20);
```

## 🌐 Com Mock HTTP Interceptor

```typescript
// environment.ts
export const environment = {
  useMockHttp: true  // Ativa automatic mock para todas requisições
};
```

Agora todos os requests HTTP são interceptados automaticamente:

```typescript
// Requisições normais - retornam dados fake
this.http.get('/api/analytics/dashboard');  // ← Mock automático
this.http.get('/api/analytics/top-clients'); // ← Mock automático
```

## 📁 Arquivos Inclusos

```
src/app/services/seed/
├── seed.service.ts              ← Gerador de dados
├── mock-http.interceptor.ts     ← Interceptor HTTP
├── SEED_SERVICE.md              ← Documentação completa
├── SEED_EXAMPLES.ts             ← Exemplos de integração
├── MOCK_HTTP_SETUP.md           ← Setup guide
└── QUICK_START.md               ← Este arquivo
```

## 🎲 Dados Gerados (Amostra)

```typescript
{
  metrics: {
    mrr: $23,450,           // Receita mensal
    arr: $281,400,          // Receita anual
    total_clients: 87,      // Total
    active_clients: 74,     // Ativos
    new_clients_this_month: 12,
    churn_rate: 3.2,        // %
    retention_rate: 96.8,   // %
    ltv: $2,840,            // Lifetime Value
    cac: $245,              // Acquisition Cost
    // ... mais 20 propriedades
  },
  
  topClients: [
    {
      establishment_name: 'Adega Dom Pérignon',
      monthly_revenue: 4500,
      plan_name: 'Plano Enterprise',
      subscription_status: 'active'
    },
    // ... 4 mais
  ],
  
  alerts: [
    {
      type: 'danger',
      title: 'Pagamento falhado',
      message: 'O pagamento do cliente foi recusado'
    },
    // ... 4 mais
  ]
  // ... mais dados
}
```

## ✅ Checklist Básico

- [ ] Importar `SeedService` no component
- [ ] Chamar `this.seed.generateCompleteData()`
- [ ] Atribuir aos properties
- [ ] Testar no template
- [ ] (Opcional) Ativar Mock HTTP no environment

## 🔗 Links Úteis

- [Documentação Completa](./SEED_SERVICE.md)
- [Exemplos de Integração](./SEED_EXAMPLES.ts)
- [Setup Mock HTTP](./MOCK_HTTP_SETUP.md)
- [Models TypeScript](../../models/analytics-metrics.model.ts)

## 🆘 Troubleshooting

**P: Dados não mudam quando chamo getCompleteData()?**
R: Cada chamada gera novos dados aleatórios. Veja randomBetween() no código.

**P: Como fixar um valor específico?**
R: Use opcões customizadas:
```typescript
this.seed.generateMetrics({ mrr: 10000 }); // ← MRR fixo
```

**P: O Mock HTTP não funciona?**
A: Verifique:
1. `environment.useMockHttp: true`
2. Interceptor registrado em app.config.ts
3. Console para mensagens de debug

**P: Como usar em testes?**
R: Injete no TestBed:
```typescript
TestBed.configureTestingModule({
  providers: [SeedService]
});
```

---

**Created**: 2026-04-16  
**Version**: 1.0  
**Status**: ✅ Production Ready
