import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { ReviewsApiService } from '../../core/http/reviews-api.service';
import { Review } from '../../core/models';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [RouterModule, FormsModule],
  template: `
    <div class="review-form-page" data-testid="review-form-page">

      @if (loading()) {
        <!-- Loading Skeleton -->
        <div class="skeleton" data-testid="loading-state">
          <div class="skeleton-line w-40"></div>
          <div class="skeleton-line w-60"></div>
          <div class="skeleton-line w-80"></div>
          <div class="skeleton-line w-50"></div>
        </div>
      } @else if (success()) {
        <!-- Success State -->
        <div class="state-container" data-testid="success-state">
          <span class="state-icon">✅</span>
          <h2 class="state-title">Avaliação enviada com sucesso!</h2>
          <a class="btn-primary" data-testid="back-to-profile-btn" [routerLink]="['/perfil', workerId()]">
            Voltar ao perfil
          </a>
        </div>
      } @else {
        <!-- Review Form -->
        <h1 class="page-title">Avaliar</h1>

        @if (error()) {
          <div class="error-banner" data-testid="error-banner">
            @if (errorCode() === 409) {
              <!-- Duplicate error -->
              <p class="error-message" data-testid="error-409">
                Você já avaliou este estabelecimento. Você pode editá-la ou excluí-la na página
                <a class="error-link" routerLink="/minhas-reviews">Minhas Reviews</a>.
              </p>
            } @else {
              <!-- Generic error -->
              <p class="error-message" data-testid="error-generic">
                Não foi possível enviar sua avaliação. Tente novamente.
              </p>
              <button class="retry-btn" data-testid="retry-btn" (click)="submit()">
                Tentar novamente
              </button>
            }
          </div>
        }

        <div class="form-section">
          <label class="form-label">Sua nota</label>
          <div class="star-selector" data-testid="star-selector">
            @for (star of [1,2,3,4,5]; track star) {
              <button
                type="button"
                class="star-btn"
                [class.active]="star <= rating()"
                [class.hovered]="star <= hoverRating()"
                data-testid="star-btn"
                (click)="setRating(star)"
                (mouseenter)="hoverRating.set(star)"
                (mouseleave)="hoverRating.set(0)"
                [disabled]="submitting()"
              >
                {{ star <= (hoverRating() || rating()) ? '★' : '☆' }}
              </button>
            }
          </div>
          @if (submitted && rating() === 0) {
            <span class="field-error" data-testid="rating-error">Selecione uma nota</span>
          }
        </div>

        <div class="form-section">
          <label class="form-label" for="comment-input">Comentário (opcional)</label>
          <textarea
            id="comment-input"
            class="form-textarea"
            data-testid="comment-input"
            [ngModel]="comment()"
            (ngModelChange)="onCommentChange($event)"
            placeholder="Compartilhe sua experiência..."
            maxlength="1000"
            rows="4"
            [attr.disabled]="submitting() ? '' : null"
          ></textarea>
          <span class="char-counter" data-testid="char-counter">{{ comment().length }}/1000</span>
        </div>

        <div class="form-actions">
          <button
            class="btn-submit"
            data-testid="submit-btn"
            (click)="submit()"
            [disabled]="submitting()"
          >
            @if (submitting()) {
              <span class="spinner" data-testid="spinner">⏳</span>
            }
            Enviar
          </button>
          <a class="btn-cancel" [routerLink]="['/perfil', workerId()]">Cancelar</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .review-form-page {
      max-width: 600px;
      margin: 0 auto;
      padding: 1rem 0 2rem;
    }
    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #04303a;
      margin: 0 0 1.5rem;
    }

    /* ── Skeleton ── */
    .skeleton {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .skeleton-line {
      height: 14px;
      background: #e0e0e0;
      border-radius: 4px;
      animation: pulse 1.5s infinite;
    }
    .skeleton-line.w-40 { width: 40%; }
    .skeleton-line.w-50 { width: 50%; }
    .skeleton-line.w-60 { width: 60%; }
    .skeleton-line.w-80 { width: 80%; }
    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    /* ── Form ── */
    .form-section {
      margin-bottom: 1.25rem;
    }
    .form-label {
      display: block;
      font-weight: 600;
      color: #04303a;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
    .star-selector {
      display: flex;
      gap: 0.25rem;
    }
    .star-btn {
      background: none;
      border: none;
      font-size: 1.75rem;
      cursor: pointer;
      color: #d0d5dd;
      transition: color 0.15s;
      padding: 0;
    }
    .star-btn.active {
      color: #ffb74d;
    }
    .star-btn.hovered {
      color: #ffb74d;
    }
    .star-btn:disabled {
      cursor: not-allowed;
    }
    .field-error {
      display: block;
      color: #e55a2b;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }
    .form-textarea {
      width: 100%;
      padding: 0.6rem;
      border: 1px solid #d0d5dd;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #04303a;
      resize: vertical;
      outline: none;
      box-sizing: border-box;
      font-family: inherit;
    }
    .form-textarea:focus {
      border-color: #00a8e8;
      box-shadow: 0 0 0 2px rgba(0, 168, 232, 0.15);
    }
    .form-textarea:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
    }
    .char-counter {
      display: block;
      text-align: right;
      font-size: 0.8rem;
      color: #97a0a6;
      margin-top: 0.25rem;
    }

    /* ── Actions ── */
    .form-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
    .btn-submit {
      padding: 0.6rem 1.5rem;
      background: #00a8e8;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .btn-submit:hover:not(:disabled) { background: #0096c7; }
    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .spinner {
      font-size: 1rem;
    }
    .btn-cancel {
      padding: 0.5rem 1rem;
      background: #ffffff;
      color: #97a0a6;
      border: 1px solid #d0d5dd;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
    }
    .btn-cancel:hover { border-color: #97a0a6; }

    /* ── Error Banner ── */
    .error-banner {
      background: #fff3f0;
      border: 1px solid #ffcdc2;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .error-message {
      font-size: 0.9rem;
      color: #c62828;
      margin: 0 0 0.5rem;
      line-height: 1.4;
    }
    .error-link {
      color: #00a8e8;
      text-decoration: underline;
      font-weight: 600;
    }
    .retry-btn {
      padding: 0.4rem 1rem;
      background: #e55a2b;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
    }
    .retry-btn:hover { background: #d04e22; }

    /* ── States ── */
    .state-container {
      text-align: center;
      padding: 3rem 1rem;
    }
    .state-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
    }
    .state-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #04303a;
      margin: 0 0 1.5rem;
    }
    .btn-primary {
      display: inline-block;
      padding: 0.6rem 1.5rem;
      background: #00a8e8;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
    }
    .btn-primary:hover { background: #0096c7; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reviewsApi = inject(ReviewsApiService);

  protected readonly workerId = signal<string>('');
  protected readonly rating = signal(0);
  protected readonly hoverRating = signal(0);
  protected readonly comment = signal('');
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly success = signal(false);
  protected readonly error = signal(false);
  protected readonly errorCode = signal<number | null>(null);

  /** Whether the form was submitted at least once (to show validation errors) */
  protected submitted = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.workerId.set(id);
    }
    this.loading.set(false);
  }

  protected setRating(star: number): void {
    this.rating.set(star);
  }

  protected onCommentChange(value: string): void {
    if (value.length <= 1000) {
      this.comment.set(value);
    }
  }

  protected submit(): void {
    this.submitted = true;
    this.error.set(false);
    this.errorCode.set(null);

    if (this.rating() === 0) {
      return;
    }

    this.submitting.set(true);

    this.reviewsApi.createReview(this.workerId(), {
      rating: this.rating(),
      comment: this.comment() || undefined,
    }).pipe(
      catchError((err) => {
        this.submitting.set(false);
        this.error.set(true);
        this.errorCode.set(err.status ?? 0);
        return of(null);
      }),
    ).subscribe((res) => {
      if (res) {
        this.submitting.set(false);
        this.success.set(true);
      }
    });
  }
}
