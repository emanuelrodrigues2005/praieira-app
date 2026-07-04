import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthApiService, RegisterRequest } from '../../core/http/auth-api.service';
import { AuthStore } from '../../core/auth/auth.store';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (!password || !confirmPassword) return null;
  return password.value === confirmPassword.value
    ? null
    : { passwordMismatch: true };
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterModule],
  template: `
    <div class="register-page">
      <!-- Left: Hero section -->
      <aside class="hero-section">
        <div class="hero-content">
          <!-- Logo -->
          <div class="hero-logo">
            <div class="logo-icon"></div>
            <div class="logo-text">
              <span class="logo-title">Praieira</span>
              <span class="logo-subtitle">Hub do turismo litorâneo de Pernambuco</span>
            </div>
          </div>

          <!-- Badge -->
          <div class="hero-badge">Bem-vindo às praias de PE</div>

          <!-- Heading -->
          <h1 class="hero-heading">Descubra o melhor<br />das praias de PE</h1>

          <!-- Subtitle -->
          <p class="hero-subtitle">
            Encontre barracas, restaurantes, passeios e muito mais nas melhores praias de
            Pernambuco — tudo num só lugar.
          </p>

          <!-- Features -->
          <div class="hero-features">
            <div class="feature-item">
              <div class="feature-icon"></div>
              <span>Mapa interativo — atrações ao seu redor em tempo real</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon"></div>
              <span>Avaliações verificadas — experiências reais de turistas</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon"></div>
              <span>Favoritos salvos — crie listas para sua viagem</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon"></div>
              <span>Contato direto — WhatsApp dos melhores locais</span>
            </div>
          </div>

          <!-- Beach tags -->
          <div class="hero-tags">
            <span class="tag">Gaibu</span>
            <span class="tag">Porto de Galinhas</span>
            <span class="tag">Praia dos Carneiros</span>
            <span class="tag">Boa Viagem</span>
          </div>
        </div>
      </aside>

      <!-- Right: Form section -->
      <main class="form-section">
        <div class="form-container">
          <!-- Tab header -->
          <div class="form-tabs">
            <a routerLink="/login" class="tab tab-inactive">Entrar</a>
            <div class="tab tab-active">Criar conta</div>
          </div>

          <!-- Heading -->
          <h2 class="form-heading">Crie sua conta 🌊</h2>
          <p class="form-subheading">
            Cadastre-se gratuitamente para aproveitar tudo que as praias têm a oferecer.
          </p>

          <!-- Divider with OR -->
          <div class="divider">
            <span class="divider-line"></span>
            <span class="divider-text">ou preencha seus dados</span>
            <span class="divider-line"></span>
          </div>

          <!-- Form -->
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
            <div class="field">
              <label for="name">Nome</label>
              <input
                id="name"
                type="text"
                formControlName="name"
                autocomplete="name"
                placeholder="Seu nome"
              />
              @if (registerForm.get('name')?.invalid && registerForm.get('name')?.touched) {
                <p class="field-error">Nome é obrigatório</p>
              }
            </div>

            <div class="field">
              <label for="email">E-mail</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                autocomplete="email"
                placeholder="seu@email.com"
              />
              @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                @if (registerForm.get('email')?.errors?.['required']) {
                  <p class="field-error">E-mail é obrigatório</p>
                }
                @if (registerForm.get('email')?.errors?.['email']) {
                  <p class="field-error">E-mail inválido</p>
                }
              }
            </div>

            <div class="field-row">
              <div class="field">
                <label for="password">Senha</label>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  autocomplete="new-password"
                  placeholder="••••••••"
                />
                @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                  @if (registerForm.get('password')?.errors?.['required']) {
                    <p class="field-error">Senha é obrigatória</p>
                  }
                  @if (registerForm.get('password')?.errors?.['minlength']) {
                    <p class="field-error">Mínimo 8 caracteres</p>
                  }
                }
              </div>
              <div class="field">
                <label for="confirmPassword">Confirmar senha</label>
                <input
                  id="confirmPassword"
                  type="password"
                  formControlName="confirmPassword"
                  autocomplete="new-password"
                  placeholder="••••••••"
                />
                @if (registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched) {
                  <p class="field-error">Senhas não conferem</p>
                }
              </div>
            </div>

            <p class="password-hint">A senha deve ter no mínimo 8 caracteres.</p>

            <!-- Role -->
            <div class="field">
              <label for="role">Tipo de conta</label>
              <select id="role" formControlName="role">
                <option value="TOURIST">Turista</option>
                <option value="WORKER">Empreendedor</option>
              </select>
            </div>

            @if (errorMessage()) {
              <p class="error-message">{{ errorMessage() }}</p>
            }

            <button type="submit" class="submit-btn" [disabled]="registerForm.invalid || loading()">
              {{ loading() ? 'Criando conta...' : 'Criar minha conta' }}
            </button>
          </form>

          <!-- Entrepreneur card -->
          <div class="entrepreneur-card">
            <div class="entrepreneur-icon"></div>
            <div class="entrepreneur-text">
              <strong>É empreendedor?</strong>
              <span>Cadastre seu estabelecimento e apareça no mapa das praias</span>
            </div>
          </div>

          <!-- Login link -->
          <p class="login-link">
            Já tem uma conta? <a routerLink="/login">Entrar agora</a>
          </p>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      /* ========== PAGE LAYOUT ========== */
      .register-page {
        display: flex;
        min-height: 100vh;
        background: #fffdf7;
      }

      /* ========== LEFT HERO ========== */
      .hero-section {
        width: 691px;
        flex-shrink: 0;
        position: relative;
        background-size: cover;
        background-position: center;
        overflow: hidden;
      }

      /* Gradient overlay matching Figma: #0096c7→#003a5c→#ff6b35 */
      .hero-section::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          160deg,
          rgba(0, 150, 199, 0.65) 0%,
          rgba(0, 58, 92, 0.45) 55%,
          rgba(255, 107, 53, 0.4) 100%
        );
        z-index: 1;
      }

      /* Beach background image using a solid fallback */
      .hero-section::after {
        content: '';
        position: absolute;
        inset: 0;
        background: #0a2a3a;
        z-index: 0;
      }

      .hero-content {
        position: relative;
        z-index: 2;
        padding: 40px 44px;
        display: flex;
        flex-direction: column;
        gap: 0;
        min-height: 100vh;
      }

      /* Logo */
      .hero-logo {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 0;
      }
      .logo-icon {
        width: 44px;
        height: 44px;
        border-radius: 6px;
        background: #00a8e8;
        flex-shrink: 0;
      }
      .logo-text {
        display: flex;
        flex-direction: column;
      }
      .logo-title {
        font-family: Inter, sans-serif;
        font-weight: 900;
        font-size: 24px;
        color: #ffffff;
        line-height: 1.2;
      }
      .logo-subtitle {
        font-family: Inter, sans-serif;
        font-weight: 400;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.65);
        line-height: 1.3;
      }

      /* Badge */
      .hero-badge {
        display: inline-flex;
        align-items: center;
        padding: 6px 16px;
        margin-top: 260px;
        background: rgba(0, 150, 199, 0.3);
        border: 1px solid rgba(0, 150, 199, 0.5);
        border-radius: 12px;
        font-family: Inter, sans-serif;
        font-weight: 700;
        font-size: 12px;
        color: #c9eefa;
        align-self: flex-start;
      }

      /* Heading */
      .hero-heading {
        font-family: Inter, sans-serif;
        font-weight: 900;
        font-size: 38px;
        color: #ffffff;
        line-height: 43px;
        margin: 18px 0 0;
      }

      /* Subtitle */
      .hero-subtitle {
        font-family: Inter, sans-serif;
        font-weight: 400;
        font-size: 15px;
        color: rgba(255, 255, 255, 0.82);
        line-height: 24px;
        margin: 16px 0 0;
        max-width: 400px;
      }

      /* Features */
      .hero-features {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 32px;
      }
      .feature-item {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .feature-icon {
        width: 36px;
        height: 36px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.22);
        flex-shrink: 0;
      }
      .feature-item span {
        font-family: Inter, sans-serif;
        font-weight: 500;
        font-size: 13px;
        color: #ffffff;
        line-height: 18px;
      }

      /* Beach tags */
      .hero-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 48px;
      }
      .tag {
        padding: 6px 18px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.18);
        border: 1px solid rgba(255, 255, 255, 0.28);
        font-family: Inter, sans-serif;
        font-weight: 700;
        font-size: 12px;
        color: #ffffff;
      }

      /* ========== RIGHT FORM ========== */
      .form-section {
        flex: 1;
        background: #ffffff;
        display: flex;
        justify-content: center;
        padding: 0;
      }

      .form-container {
        width: 420px;
        padding: 136px 0 0;
        display: flex;
        flex-direction: column;
      }

      /* Tabs */
      .form-tabs {
        display: flex;
        gap: 0;
        margin-bottom: 16px;
        background: #fffdf7;
        border-radius: 6px;
        padding: 4px;
        align-self: flex-start;
      }
      .tab {
        padding: 9px 24px;
        border-radius: 4px;
        font-family: Inter, sans-serif;
        font-weight: 700;
        font-size: 14px;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.15s;
      }
      .tab-active {
        background: #ffffff;
        color: #073642;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      .tab-inactive {
        color: #97a0a6;
        background: transparent;
      }
      .tab-inactive:hover {
        color: #073642;
      }

      /* Form heading */
      .form-heading {
        font-family: Inter, sans-serif;
        font-weight: 900;
        font-size: 26px;
        color: #073642;
        margin: 0 0 8px;
      }
      .form-subheading {
        font-family: Inter, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: #97a0a6;
        line-height: 21px;
        margin: 0;
      }

      /* Divider */
      .divider {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 24px 0;
      }
      .divider-line {
        flex: 1;
        height: 1px;
        background: rgba(0, 0, 0, 0.08);
      }
      .divider-text {
        font-family: Inter, sans-serif;
        font-weight: 500;
        font-size: 12px;
        color: #97a0a6;
        white-space: nowrap;
      }

      /* Form */
      .register-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .field-row {
        display: flex;
        gap: 12px;
      }
      .field-row .field {
        flex: 1;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .field label {
        font-family: Inter, sans-serif;
        font-weight: 700;
        font-size: 12px;
        color: #073642;
      }
      .field input,
      .field select {
        padding: 12px 16px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 6px;
        font-family: Inter, sans-serif;
        font-weight: 500;
        font-size: 14px;
        color: #073642;
        background: #fff7ea;
        outline: none;
        transition: border-color 0.2s;
      }
      .field input::placeholder {
        color: #97a0a6;
      }
      .field input:focus,
      .field select:focus {
        border-color: #00a8e8;
        box-shadow: 0 0 0 2px rgba(0, 168, 232, 0.15);
      }
      .field input.ng-invalid.ng-touched {
        border-color: #e63946;
      }
      .field select {
        background: #fff7ea;
        cursor: pointer;
        appearance: auto;
      }
      .field-error {
        color: #e63946;
        font-family: Inter, sans-serif;
        font-size: 11px;
        margin: 0;
      }

      .password-hint {
        font-family: Inter, sans-serif;
        font-weight: 400;
        font-size: 11px;
        color: #97a0a6;
        margin: -8px 0 0;
        line-height: 15px;
      }

      .error-message {
        color: #e63946;
        font-family: Inter, sans-serif;
        font-size: 13px;
        text-align: center;
        margin: 0;
        padding: 8px;
        background: rgba(230, 57, 70, 0.08);
        border-radius: 6px;
      }

      .submit-btn {
        padding: 12px 24px;
        background: #00a8e8;
        color: #ffffff;
        border: none;
        border-radius: 6px;
        font-family: Inter, sans-serif;
        font-weight: 700;
        font-size: 15px;
        cursor: pointer;
        transition: background 0.2s;
        height: 45px;
      }
      .submit-btn:hover:not(:disabled) {
        background: #0096c7;
      }
      .submit-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Entrepreneur card */
      .entrepreneur-card {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-top: 24px;
        padding: 17px 19px;
        border-radius: 8px;
        background: linear-gradient(135deg, #fff5f0, #fff9f5);
        border: 1px solid #ffd4b8;
      }
      .entrepreneur-icon {
        width: 40px;
        height: 40px;
        border-radius: 6px;
        background: #ff6b6b;
        flex-shrink: 0;
      }
      .entrepreneur-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .entrepreneur-text strong {
        font-family: Inter, sans-serif;
        font-weight: 700;
        font-size: 13px;
        color: #073642;
      }
      .entrepreneur-text span {
        font-family: Inter, sans-serif;
        font-weight: 400;
        font-size: 12px;
        color: #97a0a6;
        line-height: 16px;
      }

      /* Login link */
      .login-link {
        text-align: center;
        margin-top: 24px;
        margin-bottom: 40px;
        font-family: Inter, sans-serif;
        font-weight: 400;
        font-size: 13px;
        color: #97a0a6;
      }
      .login-link a {
        color: #00a8e8;
        text-decoration: none;
        font-weight: 600;
      }
      .login-link a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly registerForm: FormGroup = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      role: ['TOURIST', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  ngOnInit(): void {
    if (this.authStore.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.loading()) return;

    const { name, email, password, role } = this.registerForm.getRawValue() as RegisterRequest;
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authApi.register({ name, email, password, role }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.authStore.login(
          {
            sub: res.data.user.id,
            role: res.data.user.role,
            email: res.data.user.email,
          },
          res.data.accessToken,
        );
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.errorMessage.set('Este email já está cadastrado');
        } else {
          this.errorMessage.set('Erro ao criar conta. Tente novamente.');
        }
      },
    });
  }
}
