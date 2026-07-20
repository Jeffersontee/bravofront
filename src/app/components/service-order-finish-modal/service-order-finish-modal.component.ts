import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, 
  IonIcon, IonLabel, IonItem, IonTextarea, IonInput, IonGrid, IonRow, 
  IonCol, IonList, IonSpinner, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cameraOutline, trashOutline, checkmarkCircleOutline, arrowForwardOutline, 
  arrowBackOutline, closeOutline, documentTextOutline, timeOutline, carOutline, cashOutline
} from 'ionicons/icons';
import { ServiceOrderService } from 'src/app/services/service-order/service-order.service';

@Component({
  selector: 'app-service-order-finish-modal',
  templateUrl: './service-order-finish-modal.component.html',
  styleUrls: ['./service-order-finish-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, 
    IonIcon, IonLabel, IonItem, IonTextarea, IonInput, IonGrid, IonRow, 
    IonCol, IonList, IonSpinner
  ]
})
export class ServiceOrderFinishModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private fb = inject(FormBuilder);
  private serviceOrderService = inject(ServiceOrderService);

  // Input properties passed by modal controller
  public orderId!: string;

  public currentStep = signal<number>(1);
  public isSubmitting = signal<boolean>(false);

  // Photos
  public imagesBefore = signal<string[]>([]);
  public imagesAfter = signal<string[]>([]);
  public isUploading = signal<boolean>(false);

  // Form Group
  public finishForm!: FormGroup;

  // Signature Canvas
  @ViewChild('signatureCanvas', { static: false }) canvasEl!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;

  constructor() {
    addIcons({
      cameraOutline, trashOutline, checkmarkCircleOutline, arrowForwardOutline, 
      arrowBackOutline, closeOutline, documentTextOutline, timeOutline, carOutline, cashOutline
    });
  }

  ngOnInit() {
    this.finishForm = this.fb.group({
      observations: ['', Validators.required],
      time_spent: ['1h 30m', Validators.required],
      km_driven: ['12', Validators.required],
      fuel_cost: ['25.00', Validators.required]
    });
  }

  // --- STEPS NAVIGATION ---
  nextStep() {
    if (this.currentStep() < 3) {
      this.currentStep.update(s => s + 1);
      if (this.currentStep() === 3) {
        setTimeout(() => this.initCanvas(), 100);
      }
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  dismiss(data?: any) {
    this.modalCtrl.dismiss(data);
  }

  // --- PHOTO HANDLING ---
  onFileSelected(event: any, type: 'before' | 'after') {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    this.isUploading.set(true);

    // Simulate Cloudinary upload / base64 conversion
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64 = e.target.result;
      
      // Mock Cloudinary URL after 800ms
      setTimeout(() => {
        const mockCloudinaryUrl = `https://res.cloudinary.com/demo/image/upload/v1/${Date.now()}`;
        if (type === 'before') {
          this.imagesBefore.update(imgs => [...imgs, base64]);
        } else {
          this.imagesAfter.update(imgs => [...imgs, base64]);
        }
        this.isUploading.set(false);
      }, 800);
    };
    reader.readAsDataURL(files[0]);
  }

  removePhoto(index: number, type: 'before' | 'after') {
    if (type === 'before') {
      this.imagesBefore.update(imgs => imgs.filter((_, i) => i !== index));
    } else {
      this.imagesAfter.update(imgs => imgs.filter((_, i) => i !== index));
    }
  }

  // --- CANVAS SIGNATURE ---
  initCanvas() {
    const canvas = this.canvasEl.nativeElement;
    // Set display size
    canvas.width = canvas.parentElement?.clientWidth || 340;
    canvas.height = 180;
    
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

  // --- SUBMIT REPORT ---
  submitReport() {
    if (this.finishForm.invalid) return;

    this.isSubmitting.set(true);

    // Get Signature Base64
    const signatureBase64 = this.canvasEl.nativeElement.toDataURL('image/png');

    const formValues = this.finishForm.getRawValue();

    const updatePayload = {
      observations: formValues.observations,
      time_spent: formValues.time_spent,
      km_driven: formValues.km_driven,
      fuel_cost: formValues.fuel_cost,
      images_url: [...this.imagesBefore(), ...this.imagesAfter()],
      follower_signature: signatureBase64,
      report_pdf_url: `https://bravo-reports.s3.amazonaws.com/report-${this.orderId}.pdf` // Mock PDF URL
    };

    // First update the service order attributes
    this.serviceOrderService.updateServiceOrder(this.orderId, updatePayload).subscribe({
      next: (res) => {
        // Then transition status to CONCLUIDO
        this.serviceOrderService.updateStatus(this.orderId, 'CONCLUIDO').subscribe({
          next: (statusRes) => {
            this.isSubmitting.set(false);
            this.dismiss({ refresh: true });
          },
          error: (err) => {
            console.error('Error transitioning status', err);
            this.isSubmitting.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error updating service order details', err);
        this.isSubmitting.set(false);
      }
    });
  }
}
