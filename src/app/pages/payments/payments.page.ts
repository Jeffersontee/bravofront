import { Component, OnInit, inject, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  businessOutline, refreshOutline, walletOutline,
  receiptOutline, checkmarkCircleOutline, timeOutline,
  alertCircleOutline, closeCircleOutline, qrCodeOutline,
  arrowBackOutline, downloadOutline
} from 'ionicons/icons';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { PaymentService, Invoice, InvoiceStats } from 'src/app/services/payment/payment.service';
import { CompanyService, Company } from 'src/app/services/company/company.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { InvoiceListComponent } from 'src/app/components/invoice-list/invoice-list.component';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

@Component({
  selector: 'app-payments',
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, InvoiceListComponent]
})
export class PaymentsPage implements OnInit, AfterViewInit {
  @ViewChild('growthChart') growthChartRef!: ElementRef<HTMLCanvasElement>;

  private paymentService = inject(PaymentService);
  private companyService = inject(CompanyService);
  private profileService = inject(ProfileService);
  private global = inject(GlobalService);
  private alertCtrl = inject(AlertController);

  public isSuperAdmin = signal(false);
  public isLoading = signal(true);
  public isStatsLoading = signal(true);
  public companies = signal<Company[]>([]);
  public selectedCompanyId = signal<string>('ALL');
  public invoices = signal<Invoice[]>([]);
  public stats = signal<InvoiceStats>({
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    monthlyGrowth: []
  });

  private chartInstance: Chart | null = null;

  constructor() {
    addIcons({
      businessOutline, refreshOutline, walletOutline,
      receiptOutline, checkmarkCircleOutline, timeOutline,
      alertCircleOutline, closeCircleOutline, qrCodeOutline,
      arrowBackOutline, downloadOutline
    });
  }

  async ngOnInit() {
    await this.checkUserRole();
    if (this.isSuperAdmin()) {
      this.loadCompanies();
    }
    await this.loadAll();
  }

  ngAfterViewInit() {
    // Gráfico inicializado após carregar dados
  }

  async checkUserRole() {
    try {
      const user = await this.profileService.getProfile();
      this.isSuperAdmin.set(user?.type === 'super_admin');
    } catch (e) {
      console.error('Erro ao obter perfil:', e);
    }
  }

  loadCompanies() {
    this.companyService.getCompanies().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.companies.set(res.data);
        }
      },
      error: (err) => console.error('Erro ao carregar lista de empresas:', err)
    });
  }

  async onCompanyChange(companyId: string) {
    this.selectedCompanyId.set(companyId);
    await this.loadAll();
  }

  async loadAll() {
    await Promise.all([
      this.loadStats(),
      this.loadInvoices()
    ]);
  }

  loadStats(): Promise<void> {
    this.isStatsLoading.set(true);
    return new Promise((resolve) => {
      this.paymentService.getInvoiceStats(this.selectedCompanyId()).subscribe({
        next: (res) => {
          if (res?.success && res.data) {
            this.stats.set(res.data);
            this.renderGrowthChart(res.data.monthlyGrowth);
          }
          this.isStatsLoading.set(false);
          resolve();
        },
        error: (err) => {
          console.error('Erro ao carregar estatísticas financeiras:', err);
          this.isStatsLoading.set(false);
          resolve();
        }
      });
    });
  }

  loadInvoices(): Promise<void> {
    this.isLoading.set(true);
    const params: any = {};
    if (this.selectedCompanyId() !== 'ALL') {
      params.company_id = this.selectedCompanyId();
    }

    return new Promise((resolve) => {
      this.paymentService.getInvoices(params).subscribe({
        next: (res) => {
          if (res?.success && res.data) {
            this.invoices.set(res.data);
          }
          this.isLoading.set(false);
          resolve();
        },
        error: (err) => {
          console.error('Erro ao carregar faturas:', err);
          this.isLoading.set(false);
          resolve();
        }
      });
    });
  }

  renderGrowthChart(growthData: { month: string; amount: number }[]) {
    if (!this.growthChartRef?.nativeElement) {
      setTimeout(() => this.renderGrowthChart(growthData), 200);
      return;
    }

    const labels = growthData && growthData.length > 0
      ? growthData.map(d => d.month)
      : ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const values = growthData && growthData.length > 0
      ? growthData.map(d => d.amount)
      : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.growthChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Faturamento (R$)',
            data: values,
            borderColor: '#3880ff',
            backgroundColor: 'rgba(56, 128, 255, 0.08)',
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#3880ff',
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => ` R$ ${(context.parsed.y ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `R$ ${value}`
            }
          }
        }
      }
    });
  }

  async handleManualPay(invoice: Invoice) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Baixa Manual',
      message: `Deseja registrar o pagamento manual da fatura no valor de R$ ${invoice.amount.toFixed(2)}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => {
            this.paymentService.markAsPaid(invoice._id).subscribe({
              next: () => {
                this.global.successToast('Fatura marcada como paga com sucesso!');
                this.loadAll();
              },
              error: (err) => {
                console.error('Erro ao baixar fatura:', err);
                this.global.errorToast('Erro ao registrar baixa manual.');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async handlePix(invoice: Invoice) {
    try {
      this.global.showLoader();
      this.paymentService.generatePixForInvoice(invoice._id).subscribe({
        next: async (res) => {
          this.global.hideLoader();
          if (res?.success && res.data) {
            const qrCode = res.data.qr_code || '';
            const qrBase64 = res.data.qr_code_base64;
            const amount = res.data.amount || invoice.amount;

            const alert = await this.alertCtrl.create({
              header: 'Pagamento via PIX',
              subHeader: `Valor: R$ ${amount.toFixed(2)}`,
              message: qrCode
                ? `Copie o código abaixo e cole no seu aplicativo bancário:<br><br><textarea readonly style="width: 100%; height: 80px; font-size: 11px; border-radius: 6px; padding: 6px;">${qrCode}</textarea>`
                : 'Código PIX gerado com sucesso. Verifique seu aplicativo.',
              buttons: [
                {
                  text: 'Copiar Código',
                  handler: () => {
                    if (qrCode) {
                      navigator.clipboard.writeText(qrCode);
                      this.global.successToast('Código PIX copiado!');
                    }
                  }
                },
                { text: 'Fechar', role: 'cancel' }
              ]
            });
            await alert.present();
          }
        },
        error: (err) => {
          this.global.hideLoader();
          console.error('Erro ao gerar PIX:', err);
          this.global.errorToast('Não foi possível gerar o PIX para esta fatura.');
        }
      });
    } catch (e) {
      this.global.hideLoader();
    }
  }
}
