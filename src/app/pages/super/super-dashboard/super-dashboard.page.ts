import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  businessOutline, peopleOutline, clipboardOutline,
  checkmarkCircleOutline, timeOutline, closeCircleOutline,
  menuOutline
} from 'ionicons/icons';
import { DashboardService, DashboardStats } from 'src/app/services/dashboard/dashboard.service';
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Registrar os módulos do Chart.js que vamos usar
Chart.register(
  BarController, BarElement,
  LineController, LineElement, PointElement,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler
);

@Component({
  selector: 'app-super-dashboard',
  templateUrl: './super-dashboard.page.html',
  styleUrls: ['./super-dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class SuperDashboardPage implements OnInit, AfterViewInit {
  @ViewChild('ordersChart') ordersChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('subscriptionsChart') subscriptionsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;

  private dashboardService = inject(DashboardService);

  isLoading = signal(true);
  stats = signal<DashboardStats | null>(null);

  private ordersChart: Chart | null = null;
  private subscriptionsChart: Chart | null = null;
  private statusChart: Chart | null = null;

  constructor() {
    addIcons({
      businessOutline, peopleOutline, clipboardOutline,
      checkmarkCircleOutline, timeOutline, closeCircleOutline,
      menuOutline
    });
  }

  ngOnInit() {
    this.loadStats();
  }

  ngAfterViewInit() {
    // Os gráficos serão criados depois que os dados carregarem
  }

  private loadStats() {
    this.isLoading.set(true);
    this.dashboardService.getStats().subscribe({
      next: (res) => {
        this.stats.set(res.data);
        this.isLoading.set(false);
        // Aguardar o próximo tick para os canvas estarem no DOM
        setTimeout(() => this.renderCharts(), 100);
      },
      error: (err) => {
        console.error('Erro ao carregar dashboard:', err);
        this.isLoading.set(false);
      }
    });
  }

  private renderCharts() {
    const data = this.stats();
    if (!data) return;
    this.renderOrdersByMonth(data);
    this.renderSubscriptions(data);
    this.renderOrdersByStatus(data);
  }

  private renderOrdersByMonth(data: DashboardStats) {
    if (!this.ordersChartRef) return;
    const ctx = this.ordersChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const months = data.charts.ordersByMonth.map(item => {
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${monthNames[item._id.month - 1]}/${String(item._id.year).slice(2)}`;
    });

    if (this.ordersChart) this.ordersChart.destroy();

    this.ordersChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Total de Ordens',
            data: data.charts.ordersByMonth.map(i => i.total),
            backgroundColor: 'rgba(255, 196, 9, 0.7)',
            borderColor: '#ffc409',
            borderWidth: 1,
            borderRadius: 6
          },
          {
            label: 'Concluídas',
            data: data.charts.ordersByMonth.map(i => i.completed),
            backgroundColor: 'rgba(22, 163, 74, 0.7)',
            borderColor: '#16a34a',
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { family: "'Outfit', sans-serif" } } },
          tooltip: { backgroundColor: '#1a1a1a', titleFont: { family: "'Outfit', sans-serif" }, bodyFont: { family: "'Outfit', sans-serif" } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: "'Outfit', sans-serif", size: 12 } } },
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: "'Outfit', sans-serif", size: 12 }, stepSize: 1 } }
        }
      }
    });
  }

  private renderSubscriptions(data: DashboardStats) {
    if (!this.subscriptionsChartRef) return;
    const ctx = this.subscriptionsChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const statusLabels: Record<string, string> = {
      active: 'Ativas',
      trialing: 'Trial',
      past_due: 'Inadimplente',
      canceled: 'Canceladas'
    };
    const statusColors: Record<string, string> = {
      active: '#16a34a',
      trialing: '#ffc409',
      past_due: '#ea580c',
      canceled: '#dc2626'
    };

    const labels = data.charts.companiesBySubscription.map(i => statusLabels[i._id] || i._id);
    const values = data.charts.companiesBySubscription.map(i => i.count);
    const colors = data.charts.companiesBySubscription.map(i => statusColors[i._id] || '#6b7280');

    if (this.subscriptionsChart) this.subscriptionsChart.destroy();

    this.subscriptionsChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { family: "'Outfit', sans-serif" } } },
          tooltip: { backgroundColor: '#1a1a1a', titleFont: { family: "'Outfit', sans-serif" }, bodyFont: { family: "'Outfit', sans-serif" } }
        }
      }
    });
  }

  private renderOrdersByStatus(data: DashboardStats) {
    if (!this.statusChartRef) return;
    const ctx = this.statusChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const statusLabels: Record<string, string> = {
      AGENDADO: 'Agendado',
      EM_DESLOCAMENTO: 'Em Deslocamento',
      CHECK_IN: 'Check-In',
      EM_EXECUCAO: 'Em Execução',
      CONCLUIDO: 'Concluído',
      CANCELADO: 'Cancelado'
    };
    const statusColors: Record<string, string> = {
      AGENDADO: '#2563eb',
      EM_DESLOCAMENTO: '#7c3aed',
      CHECK_IN: '#0891b2',
      EM_EXECUCAO: '#ffc409',
      CONCLUIDO: '#16a34a',
      CANCELADO: '#dc2626'
    };

    const labels = data.charts.ordersByStatus.map(i => statusLabels[i._id] || i._id);
    const values = data.charts.ordersByStatus.map(i => i.count);
    const colors = data.charts.ordersByStatus.map(i => statusColors[i._id] || '#6b7280');

    if (this.statusChart) this.statusChart.destroy();

    this.statusChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Quantidade',
          data: values,
          backgroundColor: colors,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#1a1a1a', titleFont: { family: "'Outfit', sans-serif" }, bodyFont: { family: "'Outfit', sans-serif" } }
        },
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: "'Outfit', sans-serif" }, stepSize: 1 } },
          y: { grid: { display: false }, ticks: { font: { family: "'Outfit', sans-serif", size: 13 } } }
        }
      }
    });
  }
}
