import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AccountApiService } from '../../core/http/account-api.service';
import { AuthStore } from '../../core/auth/auth.store';
import { catchError, finalize, of, tap } from 'rxjs';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterModule],
  template: `
    <div class="account-page">
      <!-- Breadcrumb -->
      <nav class="breadcrumb" data-testid="breadcrumb">
        <a routerLink="/" class="breadcrumb-link">Página inicial</a>
        <span class="breadcrumb-sep">&gt;</span>
        <span class="breadcrumb-current">Perfil</span>
      </nav>

      <!-- Page Title -->
      <h1 class="page-title" data-testid="page-title">Perfil</h1>

      @if (loading() && !profileError()) {
        <!-- Loading Skeleton -->
        <div class="card skeleton-card" data-testid="profile-skeleton">
          <div class="skeleton-row">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-lines">
              <div class="skeleton-line w-40"></div>
              <div class="skeleton-line w-60"></div>
            </div>
          </div>
          <div class="skeleton-row">
            <div class="skeleton-line w-100"></div>
            <div class="skeleton-line w-100"></div>
            <div class="skeleton-line w-80"></div>
            <div class="skeleton-line w-100 h-20"></div>
          </div>
          <div class="skeleton-row skeleton-buttons">
            <div class="skeleton-line w-20 h-9"></div>
            <div class="skeleton-line w-32 h-9"></div>
          </div>
        </div>
      } @else if (profileError()) {
        <!-- Error State -->
        <div class="card error-card" data-testid="error-state">
          <p class="error-text">Não foi possível carregar seu perfil.</p>
          <button class="btn-retry" data-testid="retry-btn" (click)="loadProfile()">Tentar novamente</button>
        </div>
      } @else {
        <!-- Profile Edit Form -->
        <div class="card profile-card" [formGroup]="profileForm">
          <!-- Avatar Section -->
          <div class="avatar-section">
            <div class="avatar-label">Foto de perfil</div>
            <div class="avatar-row">
              <div class="avatar-placeholder">
                <span class="avatar-initials">{{ initials() }}</span>
              </div>
              <div class="avatar-info">
                <button type="button" class="avatar-change-link">Mudar</button>
                <span class="avatar-hint">Clique para alterar</span>
              </div>
            </div>
          </div>

          <!-- Nome completo -->
          <div class="field">
            <label for="name" class="field-label">Nome completo</label>
            <input
              id="name"
              data-testid="name-input"
              type="text"
              formControlName="name"
              class="field-input"
              placeholder="Seu nome"
            />
          </div>

          <!-- E-mail -->
          <div class="field">
            <label for="email" class="field-label">E-mail</label>
            <input
              id="email"
              data-testid="email-input"
              type="email"
              formControlName="email"
              class="field-input field-input-disabled"
            />
            <span class="field-hint">Deixe em branco para manter o email atual</span>
          </div>

          <!-- Telefone -->
          <div class="field">
            <label for="phone" class="field-label">Telefone</label>
            <input
              id="phone"
              data-testid="phone-input"
              type="tel"
              formControlName="phone"
              class="field-input"
              placeholder="+55 (81) 99999-9999"
            />
          </div>

          <!-- Bio -->
          <div class="field">
            <label for="bio" class="field-label">Bio</label>
            <textarea
              id="bio"
              data-testid="bio-input"
              formControlName="bio"
              class="field-textarea"
              placeholder="Conte um pouco sobre você"
              maxlength="500"
              rows="3"
            ></textarea>
            <span class="field-counter">{{ 500 - (profileForm.get('bio')?.value?.length ?? 0) }} caracteres restantes</span>
          </div>

          <!-- Session Info Bar -->
          <div class="session-info">
            Última sessão: hoje, {{ lastSessionTime() }}
          </div>

          <!-- Success / Error Messages -->
          @if (saveSuccess()) {
            <p class="success-message" data-testid="success-message">Perfil atualizado com sucesso</p>
          }
          @if (saveError()) {
            <p class="error-message" data-testid="error-message">Erro ao salvar. Tente novamente.</p>
          }

          <!-- Action Buttons -->
          <div class="action-row">
            <button
              type="button"
              class="btn-cancel"
              data-testid="cancel-btn"
              (click)="resetForm()"
            >Cancelar</button>
            <button
              type="button"
              class="btn-save"
              data-testid="save-btn"
              [disabled]="saving()"
              (click)="onSave()"
            >
              @if (saving()) {
                Salvando…
              } @else {
                Salvar alterações
              }
            </button>
          </div>
        </div>

        <!-- Danger Zone (Phase 3) -->
        <div class="card danger-zone-card" data-testid="danger-zone">
          <h2 class="danger-title">Zona de perigo</h2>
          <p class="danger-description">
            A exclusão da conta remove permanentemente todas as suas avaliações, favoritos e dados de perfil.
            Esta ação não pode ser desfeita.
          </p>
          <button
            type="button"
            class="btn-danger"
            data-testid="delete-account-btn"
            (click)="openDeleteModal()"
          >
            Excluir minha conta
          </button>
        </div>

        <!-- Delete Confirmation Modal -->
        @if (showDeleteModal()) {
          <div class="modal-overlay" data-testid="delete-modal">
            <div class="modal-content">
              <h3 class="modal-title">Excluir conta</h3>
              <p class="modal-text">
                Esta ação é irreversível. Todos os seus dados serão removidos permanentemente.
              </p>
              <p class="modal-instruction">
                Digite <strong>EXCLUIR</strong> para confirmar:
              </p>
              <input
                type="text"
                class="modal-input"
                data-testid="confirm-input"
                [ngModel]="deleteConfirmText()"
                (ngModelChange)="deleteConfirmText.set($event)"
                placeholder="EXCLUIR"
              />
              <div class="modal-actions">
                <button
                  type="button"
                  class="btn-cancel"
                  data-testid="modal-cancel-btn"
                  (click)="closeDeleteModal()"
                >Cancelar</button>
                <button
                  type="button"
                  class="btn-danger"
                  data-testid="modal-confirm-btn"
                  [disabled]="deleteConfirmText() !== 'EXCLUIR' || deleting()"
                  (click)="confirmDelete()"
                >
                  @if (deleting()) {
                    Excluindo…
                  } @else {
                    Confirmar exclusão
                  }
                </button>
              </div>
              @if (deleteError()) {
                <p class="error-text">Erro ao excluir conta. Tente novamente.</p>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .account-page {
      max-width: 840px;
      margin: 0 auto;
    }

    .breadcrumb {
      font-size: 13px;
      color: #97a0a6;
      margin-bottom: 0.5rem;
    }
    .breadcrumb-link {
      color: #00a8e8;
      text-decoration: none;
    }
    .breadcrumb-link:hover {
      text-decoration: underline;
    }
    .breadcrumb-sep {
      margin: 0 0.5rem;
    }
    .breadcrumb-current {
      color: #073642;
    }

    .page-title {
      font-size: 24px;
      font-weight: 700;
      color: #073642;
      margin: 0 0 1.5rem;
    }

    .card {
      background: #ffffff;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    /* Skeleton */
    .skeleton-row {
      margin-bottom: 1rem;
    }
    .skeleton-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #e0e0e0;
      animation: pulse 1.5s infinite;
    }
    .skeleton-lines {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }
    .skeleton-line {
      height: 14px;
      background: #e0e0e0;
      border-radius: 4px;
      animation: pulse 1.5s infinite;
    }
    .skeleton-line.w-40 { width: 40%; }
    .skeleton-line.w-60 { width: 60%; }
    .skeleton-line.w-80 { width: 80%; }
    .skeleton-line.w-100 { width: 100%; }
    .skeleton-line.h-20 { height: 80px; }
    .skeleton-line.h-9 { height: 36px; }
    .skeleton-line.w-20 { width: 20%; }
    .skeleton-line.w-32 { width: 32%; }
    .skeleton-buttons {
      display: flex;
      gap: 0.75rem;
    }

    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }

    /* Avatar */
    .avatar-section {
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    .avatar-label {
      font-size: 13px;
      font-weight: 700;
      color: #073642;
      margin-bottom: 0.75rem;
    }
    .avatar-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .avatar-placeholder {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #00a8e8;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .avatar-initials {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
    }
    .avatar-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .avatar-change-link {
      background: none;
      border: none;
      color: #00a8e8;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      padding: 0;
      text-align: left;
    }
    .avatar-change-link:hover {
      text-decoration: underline;
    }
    .avatar-hint {
      font-size: 11px;
      color: #97a0a6;
    }

    /* Fields */
    .field {
      margin-bottom: 1.25rem;
    }
    .field-label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: #073642;
      margin-bottom: 0.4rem;
    }
    .field-input,
    .field-textarea {
      width: 100%;
      padding: 0.65rem 0.85rem;
      border: 1px solid rgba(0,0,0,0.12);
      border-radius: 6px;
      font-size: 14px;
      color: #073642;
      background: #ffffff;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .field-input:focus,
    .field-textarea:focus {
      border-color: #00a8e8;
      box-shadow: 0 0 0 2px rgba(0, 168, 232, 0.15);
    }
    .field-input::placeholder,
    .field-textarea::placeholder {
      color: #97a0a6;
    }
    .field-input-disabled {
      background: #f5f5f5;
      color: #97a0a6;
      cursor: not-allowed;
    }
    .field-textarea {
      resize: vertical;
      min-height: 80px;
    }
    .field-hint {
      display: block;
      font-size: 11px;
      color: #97a0a6;
      margin-top: 0.25rem;
    }
    .field-counter {
      display: block;
      font-size: 11px;
      color: #97a0a6;
      margin-top: 0.25rem;
      text-align: right;
    }

    /* Session info */
    .session-info {
      background: #ffb74d;
      border-radius: 6px;
      padding: 0.6rem 0.85rem;
      font-size: 13px;
      color: #000000;
      margin-bottom: 1rem;
    }

    /* Messages */
    .success-message {
      font-size: 13px;
      color: #2e7d32;
      background: #e8f5e9;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    .error-message {
      font-size: 13px;
      color: #c62828;
      background: #ffebee;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    .error-card {
      text-align: center;
      padding: 2rem;
    }
    .error-text {
      font-size: 14px;
      color: #c62828;
      margin-bottom: 1rem;
    }
    .btn-retry {
      padding: 0.5rem 1rem;
      background: #00a8e8;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-retry:hover {
      background: #0096c7;
    }

    /* Action buttons */
    .action-row {
      display: flex;
      gap: 0.75rem;
    }
    .btn-cancel {
      padding: 0.5rem 1.25rem;
      background: #ffb74d;
      color: #073642;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-cancel:hover {
      background: #ffa726;
    }
    .btn-save {
      padding: 0.5rem 1.5rem;
      background: #00a8e8;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-save:hover:not(:disabled) {
      background: #0096c7;
    }
    .btn-save:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Danger Zone */
    .danger-zone-card {
      background: #fff5f5;
      border-color: #fecaca;
    }
    .danger-title {
      font-size: 14px;
      font-weight: 700;
      color: #e63946;
      margin: 0 0 0.5rem;
    }
    .danger-description {
      font-size: 13px;
      color: #7f1d1d;
      line-height: 1.5;
      margin: 0 0 1rem;
    }
    .btn-danger {
      padding: 0.5rem 1.25rem;
      background: #fee2e2;
      color: #e63946;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-danger:hover:not(:disabled) {
      background: #fecaca;
    }
    .btn-danger:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: #ffffff;
      border-radius: 12px;
      padding: 1.5rem;
      max-width: 420px;
      width: 90%;
    }
    .modal-title {
      font-size: 16px;
      font-weight: 700;
      color: #e63946;
      margin: 0 0 0.75rem;
    }
    .modal-text {
      font-size: 13px;
      color: #073642;
      margin: 0 0 0.5rem;
      line-height: 1.4;
    }
    .modal-instruction {
      font-size: 13px;
      color: #073642;
      margin: 0 0 0.75rem;
    }
    .modal-input {
      width: 100%;
      padding: 0.65rem 0.85rem;
      border: 1px solid #e63946;
      border-radius: 6px;
      font-size: 14px;
      color: #073642;
      outline: none;
      margin-bottom: 1rem;
      box-sizing: border-box;
    }
    .modal-input:focus {
      box-shadow: 0 0 0 2px rgba(230, 57, 70, 0.2);
    }
    .modal-actions {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly accountApi = inject(AccountApiService);
  protected readonly authStore = inject(AuthStore);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly deleting = signal(false);
  protected readonly profileError = signal(false);
  protected readonly saveError = signal(false);
  protected readonly saveSuccess = signal(false);
  protected readonly showDeleteModal = signal(false);
  protected readonly deleteConfirmText = signal('');
  protected readonly deleteError = signal(false);

  protected profileForm: FormGroup = this.fb.nonNullable.group({
    name: [''],
    email: [{ value: '', disabled: true }],
    phone: [''],
    bio: [''],
  });

  private savedProfile: any = null;
  private savedUser: any = null;

  protected readonly lastSessionTime = signal('');

  protected initials = signal('');

  ngOnInit(): void {
    this.loadProfile();
  }

  protected loadProfile(): void {
    this.loading.set(true);
    this.profileError.set(false);

    this.accountApi.getProfile().pipe(
      catchError((err) => {
        this.profileError.set(true);
        this.loading.set(false);
        return of(null);
      }),
    ).subscribe((res) => {
      if (res) {
        this.savedProfile = res.data;
        this.savedUser = res.data;
        this.profileForm.patchValue({
          name: res.data.profile?.name ?? '',
          email: res.data.email ?? '',
          phone: res.data.profile?.phone ?? '',
          bio: res.data.profile?.bio ?? '',
        });
        this.initials.set(this.getInitials(res.data.profile?.name ?? ''));
        this.lastSessionTime.set(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
        this.loading.set(false);
      }
    });
  }

  protected resetForm(): void {
    if (this.savedProfile) {
      this.profileForm.patchValue({
        name: this.savedProfile.profile?.name ?? '',
        email: this.savedProfile.email ?? '',
        phone: this.savedProfile.profile?.phone ?? '',
        bio: this.savedProfile.profile?.bio ?? '',
      });
    }
    this.saveError.set(false);
    this.saveSuccess.set(false);
  }

  protected onSave(): void {
    if (this.profileForm.invalid || this.saving()) return;

    const formValue = this.profileForm.getRawValue();
    const dto: Record<string, string> = {};

    if (formValue.name !== this.savedProfile?.profile?.name) {
      dto['name'] = formValue.name;
    }
    if (formValue.phone !== this.savedProfile?.profile?.phone) {
      dto['phone'] = formValue.phone;
    }
    if (formValue.bio !== this.savedProfile?.profile?.bio) {
      dto['bio'] = formValue.bio;
    }

    if (Object.keys(dto).length === 0) return;

    this.saving.set(true);
    this.saveError.set(false);
    this.saveSuccess.set(false);

    this.accountApi.updateProfile(dto).pipe(
      finalize(() => this.saving.set(false)),
      catchError((err) => {
        this.saveError.set(true);
        return of(null);
      }),
    ).subscribe((res) => {
      if (res) {
        this.saveSuccess.set(true);
        if (this.savedProfile) {
          this.savedProfile.profile = { ...this.savedProfile.profile, ...dto };
        }
      }
    });
  }

  protected openDeleteModal(): void {
    this.showDeleteModal.set(true);
    this.deleteConfirmText.set('');
    this.deleteError.set(false);
  }

  protected closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.deleteConfirmText.set('');
    this.deleteError.set(false);
  }

  protected confirmDelete(): void {
    if (this.deleteConfirmText() !== 'EXCLUIR' || this.deleting()) return;

    this.deleting.set(true);
    this.deleteError.set(false);

    this.accountApi.deleteAccount().pipe(
      finalize(() => this.deleting.set(false)),
      catchError((err) => {
        this.deleteError.set(true);
        return of(null);
      }),
    ).subscribe(() => {
      if (!this.deleteError()) {
        this.authStore.logout();
        window.location.href = '/login';
      }
    });
  }

  private getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}
