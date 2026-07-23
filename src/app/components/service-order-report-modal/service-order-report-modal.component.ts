import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, 
  IonIcon, IonLabel, IonItem, IonGrid, IonRow, IonCol, IonCard, 
  IonCardContent, IonList, IonBadge, ModalController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  closeOutline, downloadOutline, logoWhatsapp, documentTextOutline, 
  businessOutline, timeOutline, carOutline, cashOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { ServiceOrder } from 'src/app/services/service-order/service-order.service';

@Component({
  selector: 'app-service-order-report-modal',
  templateUrl: './service-order-report-modal.component.html',
  styleUrls: ['./service-order-report-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, 
    IonIcon, IonLabel, IonItem, IonGrid, IonRow, IonCol, IonCard, 
    IonCardContent, IonList, IonBadge
  ]
})
export class ServiceOrderReportModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);

  // Inputs
  public order!: ServiceOrder;

  constructor() {
    addIcons({
      closeOutline, downloadOutline, logoWhatsapp, documentTextOutline, 
      businessOutline, timeOutline, carOutline, cashOutline, checkmarkCircleOutline
    });
  }

  ngOnInit() {
    // Component initialization
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
}
