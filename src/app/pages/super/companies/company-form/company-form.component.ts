import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService, Company } from 'src/app/services/company/company.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Strings } from 'src/app/enum/strings';

@Component({
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class CompanyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private companyService = inject(CompanyService);
  private global = inject(GlobalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public form!: FormGroup;
  public userForm!: FormGroup;
  public isEditMode = false;
  public companyId: string | null = null;
  public isLoading = false;
  public isUsersLoading = false;
  public companyUsers: any[] = [];
  public showUserForm = false;

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      owner_name: [''],
      short_name: [''],
      description: [''],
      cnpj: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      active: [true]
    });

    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      type: ['company_owner', Validators.required],
      password: ['']
    });

    this.companyId = this.route.snapshot.paramMap.get('id');
    if (this.companyId) {
      this.isEditMode = true;
      this.loadCompany(this.companyId);
      this.loadUsers(this.companyId);
    }
  }

  loadCompany(id: string) {
    this.isLoading = true;
    this.companyService.getCompanyById(id).subscribe({
      next: (res: any) => {
        this.form.patchValue(res.data);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.global.errorToast('Erro ao carregar empresa');
        this.isLoading = false;
      }
    });
  }

  loadUsers(id: string) {
    this.isUsersLoading = true;
    this.companyService.getCompanyUsers(id).subscribe({
      next: (res: any) => {
        this.companyUsers = res.data;
        this.isUsersLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.global.errorToast('Erro ao carregar usuários');
        this.isUsersLoading = false;
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const data = this.form.getRawValue();

    if (this.isEditMode) {
      this.companyService.updateCompany(this.companyId!, data).subscribe({
        next: (res: any) => {
          this.global.successToast('Empresa atualizada!');
          this.router.navigateByUrl(Strings.SUPER_COMPANIES);
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error(err);
          this.global.errorToast('Erro ao salvar');
          this.isLoading = false;
        }
      });
    } else {
      this.companyService.createCompany(data).subscribe({
        next: (res: any) => {
          this.global.successToast('Empresa criada!');
          this.router.navigateByUrl(Strings.SUPER_COMPANIES);
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error(err);
          this.global.errorToast('Erro ao salvar');
          this.isLoading = false;
        }
      });
    }
  }

  // --- Usuários ---

  toggleUserForm() {
    this.showUserForm = !this.showUserForm;
    if (!this.showUserForm) {
      this.userForm.reset({ type: 'company_owner' });
    }
  }

  assignUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    this.isUsersLoading = true;
    const data = this.userForm.getRawValue();
    this.companyService.assignUser(this.companyId!, data).subscribe({
      next: (res: any) => {
        this.global.successToast('Usuário vinculado com sucesso!');
        this.toggleUserForm();
        this.loadUsers(this.companyId!);
      },
      error: (err: any) => {
        console.error(err);
        this.global.errorToast(err.error?.message || 'Erro ao vincular usuário');
        this.isUsersLoading = false;
      }
    });
  }

  async removeUser(userId: string) {
    const confirm = await this.global.showButtonToast('Tem certeza que deseja desvincular este usuário?');
    if (!confirm) return;

    this.isUsersLoading = true;
    this.companyService.removeUser(this.companyId!, userId).subscribe({
      next: () => {
        this.global.successToast('Usuário removido da empresa');
        this.loadUsers(this.companyId!);
      },
      error: (err: any) => {
        console.error(err);
        this.global.errorToast('Erro ao remover usuário');
        this.isUsersLoading = false;
      }
    });
  }
}