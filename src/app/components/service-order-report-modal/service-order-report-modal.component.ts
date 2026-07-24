import { Component, ElementRef, OnInit, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, 
  IonIcon, IonLabel, IonItem, IonGrid, IonRow, IonCol, IonCard, 
  IonCardContent, IonList, IonBadge, ModalController, ToastController,
  IonTextarea, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  closeOutline, downloadOutline, logoWhatsapp, documentTextOutline, 
  businessOutline, timeOutline, carOutline, cashOutline, checkmarkCircleOutline,
  star, starOutline
} from 'ionicons/icons';
import { ServiceOrder, ServiceOrderService } from 'src/app/services/service-order/service-order.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { Strings } from 'src/app/enum/strings';

@Component({
  selector: 'app-service-order-report-modal',
  templateUrl: './service-order-report-modal.component.html',
  styleUrls: ['./service-order-report-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, 
    IonIcon, IonLabel, IonItem, IonGrid, IonRow, IonCol, IonCard, 
    IonCardContent, IonList, IonBadge, IonTextarea, IonSpinner
  ]
})
export class ServiceOrderReportModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);
  private serviceOrderService = inject(ServiceOrderService);
  private profileService = inject(ProfileService);

  // Inputs
  public order!: ServiceOrder;

  // Lojista Sign & Comment
  public lojistaComment = signal<string>('');
  public lojistaStars = signal<number>(5);
  public isSubmitting = signal<boolean>(false);

  // Canvas
  @ViewChild('lojistaCanvas', { static: false }) canvasEl!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;

  userType = computed(() => (this.profileService.profile() as any)?.type);
  isLojista = computed(() => this.userType() === Strings.COMPANY_OWNER_TYPE || this.userType() === 'user');

  constructor() {
    addIcons({
      closeOutline, downloadOutline, logoWhatsapp, documentTextOutline, 
      businessOutline, timeOutline, carOutline, cashOutline, checkmarkCircleOutline,
      star, starOutline
    });
  }

  ngOnInit() {
    // Se a OS precisar de assinatura do lojista, inicializamos o canvas em breve
    if (this.order.current_status === 'RELATORIO_CHECKOUT' && this.isLojista()) {
      setTimeout(() => this.initCanvas(), 300);
    }
  }

  // --- CANVAS SIGNATURE ---
  initCanvas() {
    if (!this.canvasEl) return;
    const canvas = this.canvasEl.nativeElement;
    canvas.width = canvas.parentElement?.clientWidth || 340;
    canvas.height = 150;
    
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.ctx.strokeStyle = '#1a1a1a';
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  startDrawing(e: MouseEvent | TouchEvent) {
    this.isDrawing = true;
    const coords = this.getCoords(e);
    this.ctx.beginPath();
    this.ctx.moveTo(coords.x, coords.y);
  }

  draw(e: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;
    e.preventDefault();
    const coords = this.getCoords(e);
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  clearCanvas() {
    if (!this.canvasEl) return;
    const canvas = this.canvasEl.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  private getCoords(e: MouseEvent | TouchEvent): { x: number; y: number } {
    const canvas = this.canvasEl.nativeElement;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  }

  // --- SUBMIT SIGNATURE & FINISH ---
  submitLojistaSignature() {
    if (!this.canvasEl || !this.order._id) return;
    this.isSubmitting.set(true);

    const signatureBase64 = this.canvasEl.nativeElement.toDataURL('image/png');

    this.serviceOrderService.evaluateOrder(this.order._id, {
      follower_signature: signatureBase64,
      stars: this.lojistaStars(),
      comment: this.lojistaComment() || 'Serviço aprovado pelo lojista.'
    }).subscribe({
      next: (res: any) => {
        this.isSubmitting.set(false);
        this.showToast('Visita e relatório concluídos com sucesso!');
        this.modalCtrl.dismiss({ refresh: true });
      },
      error: (err) => {
        console.error('Erro ao avaliar OS', err);
        this.isSubmitting.set(false);
        this.showToast('Erro ao enviar aprovação do relatório.');
      }
    });
  }

  get companyName(): string {
    return (this.order?.company_id as any)?.name || 'Não informado';
  }

  get unitName(): string {
    return (this.order?.unit_id as any)?.name || 'Unidade Principal';
  }

  get collaboratorName(): string {
    return (this.order?.collaborator_id as any)?.name || 'Técnico Bravo';
  }

  get serviceName(): string {
    return (this.order?.service_id as any)?.name || '';
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async generatePdf() {
    window.print();
  }

  async shareWhatsApp() {
    const serviceName = (this.order.service_id as any)?.name || 'Serviço';
    const unitName = (this.order.unit_id as any)?.name || 'Unidade';
    const collaboratorName = (this.order.collaborator_id as any)?.name || 'Técnico';
    const pdfUrl = this.order.report_pdf_url || 'https://bravo-reports.s3.amazonaws.com/report.pdf';

    const message = encodeURIComponent(
      `Olá! Segue o Relatório Técnico da Ordem de Serviço de *${serviceName}* na unidade *${unitName}*.\n\n` +
      `Status: Concluído\n` +
      `Executado por: ${collaboratorName}\n\n` +
      `Link para download do PDF: ${pdfUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'dark'
    });
    await toast.present();
  }
}
