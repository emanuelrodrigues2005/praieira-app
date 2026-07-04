import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthApiService } from '../../core/http/auth-api.service';
import { AuthStore } from '../../core/auth/auth.store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-page">
      <!-- LEFT: Hero / Brand Side -->
      <div class="hero-side">
        <div class="hero-bg"></div>

        <div class="hero-content">
          <!-- Top logo -->
          <div class="logo-area">
            <div class="logo-mark"></div>
            <div class="logo-text">
              <span class="brand-name">Praieira</span>
              <span class="brand-tagline">Hub do turismo litorâneo de Pernambuco</span>
            </div>
          </div>

          <!-- Bottom content -->
          <div class="hero-bottom">
            <h1 class="hero-title">Descubra o melhor<br/>das praias de PE</h1>
            <p class="hero-description">
              Conectamos turistas a empreendedores locais autênticos. Encontre
              quiosques, passeios, artesanato e muito mais nas orlas de
              Pernambuco.
            </p>

            <div class="beach-pills">
              <span class="pill">Gaibu</span>
              <span class="pill">Porto de Galinhas</span>
              <span class="pill">Praia dos Carneiros</span>
              <span class="pill">Boa Viagem</span>
            </div>

            <div class="stats-row">
              <div class="stat">
                <span class="stat-number">+380</span>
                <span class="stat-label">Empreendedores</span>
              </div>
              <div class="stat">
                <span class="stat-number">4</span>
                <span class="stat-label">Praias cobertas</span>
              </div>
              <div class="stat">
                <span class="stat-number">4.8★</span>
                <span class="stat-label">Avaliação média</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Form Side -->
      <div class="form-side">
        <div class="form-panel">
          <h1 class="form-title">Bem-vindo de volta 👋</h1>
          <p class="form-subtitle">
            Entre na sua conta ou crie uma nova para começar a explorar.
          </p>

          <!-- Tab Toggle: Entrar / Criar conta -->
          <div class="tab-toggle">
            <button class="tab tab-active" type="button">Entrar</button>
            <button class="tab tab-inactive" type="button" routerLink="/cadastro">
              Criar conta
            </button>
          </div>

          <!-- Login Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <!-- E-mail field -->
            <div class="field">
              <label for="email">E-mail</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 4H2C1.44772 4 1 4.44772 1 5V11C1 11.5523 1.44772 12 2 12H14C14.5523 12 15 11.5523 15 11V5C15 4.44772 14.5523 4 14 4Z" stroke="#97a0a6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M1 5L8 9L15 5" stroke="#97a0a6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="joao@exemplo.com"
                  autocomplete="email"
                />
              </div>
            </div>

            <!-- Senha field -->
            <div class="field">
              <label for="password">Senha</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 7V5C12 2.79086 10.2091 1 8 1C5.79086 1 4 2.79086 4 5V7" stroke="#97a0a6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <rect x="2" y="7" width="12" height="8" rx="2" stroke="#97a0a6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="8" cy="11" r="1" fill="#97a0a6"/>
                </svg>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  placeholder="••••••••••"
                  autocomplete="current-password"
                />
              </div>
            </div>

            <!-- Options row -->
            <div class="options-row">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  [formControl]="rememberMe"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                Lembrar de mim
              </label>
              <a class="forgot-link">Esqueci minha senha</a>
            </div>

            @if (errorMessage()) {
              <p class="error-message">{{ errorMessage() }}</p>
            }

            <!-- Primary CTA -->
            <button
              type="submit"
              class="btn-primary"
              [disabled]="loginForm.invalid || loading()"
            >
              @if (loading()) {
                Entrando…
              } @else {
                Entrar
              }
            </button>

            <!-- Divider -->
            <div class="divider">
              <span class="divider-line"></span>
              <span class="divider-text">ou continue com</span>
              <span class="divider-line"></span>
            </div>

            <!-- Google OAuth -->
            <button type="button" class="btn-social" (click)="onGoogleLogin()">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5818V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
                <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5818C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957273V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
                <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957273 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
              </svg>
              Entrar com Google
            </button>

            <!-- Browse without login -->
            <button type="button" class="btn-ghost" routerLink="/">
              Acessar sem login
            </button>

            <!-- Register footer -->
            <p class="register-footer">
              Não tem conta? <a routerLink="/cadastro">Criar conta grátis</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
  styleUrl: './login.component.css',

})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  constructor() {
    if (this.authStore.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly rememberMe = new FormControl(false);

  protected readonly loginForm: FormGroup = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading()) return;

    const { email, password } = this.loginForm.getRawValue();
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authApi.login(email, password).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.authStore.login(
          {
            sub: res.data.user.id,
            role: res.data.user.role,
            email: res.data.user.email,
          },
          res.data.accessToken,
          res.data.refreshToken,
        );
        this.router.navigate(['/']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Email ou senha inválidos');
      },
    });
  }

  onGoogleLogin(): void {
    // Placeholder — Google OAuth not yet implemented
  }
}
