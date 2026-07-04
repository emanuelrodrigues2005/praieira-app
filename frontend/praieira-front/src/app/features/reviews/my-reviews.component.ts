import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ReviewsApiService } from '../../core/http/reviews-api.service';
import { Review, PaginatedResponse } from '../../core/models';
import { PaginationComponent } from '../../shared/ui/pagination.component';
import { RatingStarsComponent } from '../../shared/ui/rating-stars.component';

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [RouterModule, PaginationComponent, RatingStarsComponent],
  template: `
    <div class="my-reviews-page">
      <h1 class="page-title">Minhas Reviews</h1>

      <!-- Loading: Skeleton -->
      @if (loading() && !error()) {
        <div class="skeleton-list" data-testid="loading-state">
          @for (s of [1,2,3,4]; track s) {
            <div class="skeleton-card" data-testid="skeleton-card">
              <div class="skeleton-line w-40"></div>
              <div class="skeleton-line w-60"></div>
              <div class="skeleton-line w-100"></div>
              <div class="skeleton-line w-30"></div>
            </div>
          }
        </div>
      }

      <!-- Error state -->
      @if (error()) {
        <div class="state-container" data-testid="error-state">
          <p class="state-message">Não foi possível carregar suas avaliações.</p>
          <button class="retry-btn" data-testid="retry-btn" (click)="loadReviews()">
            Tentar novamente
          </button>
        </div>
      }

      <!-- Empty state -->
      @if (!loading() && !error() && reviews().length === 0) {
        <div class="state-container" data-testid="empty-state">
          <span class="state-icon">📝</span>
          <p class="state-message">Você ainda não fez nenhuma avaliação</p>
          <p class="state-hint">Explore os estabelecimentos e compartilhe sua experiência!</p>
          <a class="btn-primary" data-testid="explorar-link" routerLink="/explorar">Descobrir estabelecimentos</a>
        </div>
      }

      <!-- Success: Review cards -->
      @if (!loading() && !error() && reviews().length > 0) {
        <div class="reviews-list" data-testid="reviews-list">
          @for (review of reviews(); track review.id) {
            <div class="review-card" data-testid="review-card">
              @if (editingId() !== review.id) {
                <!-- View mode -->
                <div class="review-header">
                  <a
                    class="establishment-name"
                    data-testid="establishment-link"
                    [routerLink]="['/perfil', review.workerProfileId]"
                  >
                    {{ review.establishmentName || 'Estabelecimento' }}
                  </a>
                  <span
                    class="status-badge"
                    [class.status-published]="review.status === 'PUBLISHED'"
                    [class.status-hidden]="review.status === 'HIDDEN'"
                    [class.status-removed]="review.status === 'REMOVED'"
                  >
                    {{ statusLabel(review.status) }}
                  </span>
                </div>

                <div class="review-rating">
                  <app-rating-stars [rating]="review.rating" />
                </div>

                <p class="review-comment">{{ review.comment }}</p>

                <div class="review-footer">
                  <span class="review-date">{{ formatDate(review.createdAt) }}</span>
                  <div class="review-actions">
                    <button
                      class="action-btn edit-btn"
                      data-testid="edit-btn"
                      (click)="startEdit(review)"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      class="action-btn delete-btn"
                      data-testid="delete-btn"
                      (click)="confirmDelete(review)"
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              } @else {
                <!-- Edit mode -->
                <div class="edit-mode">
                  <div class="edit-header">
                    <span class="establishment-name">{{ review.establishmentName || 'Estabelecimento' }}</span>
                  </div>

                  <div class="edit-rating">
                    <span class="edit-label">Sua nota:</span>
                    <div class="star-selector">
                      @for (star of [1,2,3,4,5]; track star) {
                        <button
                          class="star-btn"
                          [class.active]="star <= editRating()"
                          (click)="setEditRating(star)"
                        >
                          {{ star <= editRating() ? '★' : '☆' }}
                        </button>
                      }
                    </div>
                  </div>

                  <div class="edit-comment">
                    <label class="edit-label" for="edit-comment">Comentário:</label>
                    <textarea
                      id="edit-comment"
                      class="edit-textarea"
                      data-testid="edit-textarea"
                      [value]="editComment()"
                      (input)="onEditCommentInput($event)"
                      rows="4"
                    ></textarea>
                  </div>

                  <div class="edit-buttons">
                    <button
                      class="btn-save"
                      data-testid="edit-save-btn"
                      (click)="saveEdit(review.id)"
                    >
                      Salvar
                    </button>
                    <button
                      class="btn-cancel"
                      data-testid="edit-cancel-btn"
                      (click)="cancelEdit(review)"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (pagination() && pagination()!.totalPages > 1) {
          <app-pagination
            [page]="pagination()!.page"
            [totalPages]="pagination()!.totalPages"
            (pageChange)="onPageChange($event)"
          />
        }
      }

      <!-- Toast message -->
      @if (toastMessage()) {
        <div class="toast" data-testid="toast" [class.toast-success]="toastType() === 'success'" [class.toast-error]="toastType() === 'error'">
          {{ toastMessage() }}
        </div>
      }

      <!-- Delete Confirmation Dialog -->
      @if (confirmDeleteId()) {
        <div class="confirm-overlay" data-testid="confirm-dialog">
          <div class="confirm-dialog">
            <p class="confirm-message">Tem certeza que deseja excluir sua avaliação?</p>
            <div class="confirm-buttons">
              <button class="btn-cancel" data-testid="confirm-cancel-btn" (click)="cancelDelete()">Cancelar</button>
              <button class="btn-danger" data-testid="confirm-yes-btn" (click)="executeDelete(confirmDeleteId()!)">Sim, excluir</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .my-reviews-page {
      max-width: 800px;
      margin: 0 auto;
      position: relative;
    }
    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #04303a;
      margin: 0 0 1.5rem;
    }
    .skeleton-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .skeleton-card {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 1.25rem;
    }
    .skeleton-line {
      height: 14px;
      background: #e0e0e0;
      border-radius: 4px;
      margin-bottom: 0.75rem;
      animation: pulse 1.5s infinite;
    }
    .skeleton-line.w-30 { width: 30%; }
    .skeleton-line.w-40 { width: 40%; }
    .skeleton-line.w-60 { width: 60%; }
    .skeleton-line.w-100 { width: 100%; }
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
    .state-container {
      text-align: center;
      padding: 3rem 1rem;
    }
    .state-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
    }
    .state-message {
      font-size: 1rem;
      font-weight: 600;
      color: #04303a;
      margin: 0 0 0.5rem;
    }
    .state-hint {
      font-size: 0.85rem;
      color: #97a0a6;
      margin: 0 0 1rem;
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
    .retry-btn {
      padding: 0.5rem 1.5rem;
      background: #00a8e8;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.5rem;
    }
    .retry-btn:hover { background: #0096c7; }
    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .review-card {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 1.25rem;
      transition: box-shadow 0.15s;
    }
    .review-card:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .establishment-name {
      font-weight: 600;
      color: #04303a;
      text-decoration: none;
      font-size: 1rem;
    }
    .establishment-name:hover {
      color: #00a8e8;
      text-decoration: underline;
    }
    .status-badge {
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .status-published { background: #d4edda; color: #155724; }
    .status-hidden { background: #fff3cd; color: #856404; }
    .status-removed { background: #f8d7da; color: #721c24; }
    .review-rating {
      margin-bottom: 0.5rem;
    }
    .review-comment {
      font-size: 0.9rem;
      color: #4a4a4a;
      line-height: 1.5;
      margin: 0 0 0.75rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .review-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .review-date {
      font-size: 0.8rem;
      color: #97a0a6;
    }
    .review-actions {
      display: flex;
      gap: 0.5rem;
    }
    .action-btn {
      background: none;
      border: 1px solid #d0d5dd;
      border-radius: 6px;
      padding: 0.3rem 0.6rem;
      font-size: 0.8rem;
      cursor: pointer;
      color: #04303a;
      transition: all 0.15s;
    }
    .action-btn:hover {
      border-color: #00a8e8;
      color: #00a8e8;
    }
    .delete-btn:hover {
      border-color: #e55a2b;
      color: #e55a2b;
    }
    .edit-mode {
      padding: 0;
    }
    .edit-header {
      margin-bottom: 1rem;
    }
    .edit-label {
      display: block;
      font-weight: 600;
      color: #04303a;
      font-size: 0.85rem;
      margin-bottom: 0.4rem;
    }
    .edit-rating {
      margin-bottom: 1rem;
    }
    .star-selector {
      display: flex;
      gap: 0.25rem;
    }
    .star-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #d0d5dd;
      transition: color 0.15s;
      padding: 0;
    }
    .star-btn.active {
      color: #ffb74d;
    }
    .star-btn:hover {
      color: #ffb74d;
    }
    .edit-comment {
      margin-bottom: 1rem;
    }
    .edit-textarea {
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
    .edit-textarea:focus {
      border-color: #00a8e8;
      box-shadow: 0 0 0 2px rgba(0, 168, 232, 0.15);
    }
    .edit-buttons {
      display: flex;
      gap: 0.5rem;
    }
    .btn-save {
      padding: 0.5rem 1rem;
      background: #00a8e8;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-save:hover { background: #0096c7; }
    .btn-cancel {
      padding: 0.5rem 1rem;
      background: #ffffff;
      color: #97a0a6;
      border: 1px solid #d0d5dd;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
    }
    .btn-cancel:hover { border-color: #97a0a6; }
    .btn-danger {
      padding: 0.5rem 1rem;
      background: #dc3545;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-danger:hover { background: #c82333; }
    .confirm-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
    }
    .confirm-dialog {
      background: #ffffff;
      border-radius: 12px;
      padding: 1.5rem;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    }
    .confirm-message {
      font-size: 1rem;
      color: #04303a;
      margin: 0 0 1.5rem;
      text-align: center;
    }
    .confirm-buttons {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
    }
    .toast {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      animation: fadeIn 0.3s;
    }
    .toast-success { background: #28a745; }
    .toast-error { background: #dc3545; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyReviewsComponent implements OnInit {
  private readonly reviewsApi = inject(ReviewsApiService);

  protected reviews = signal<Review[]>([]);
  protected pagination = signal<PaginatedResponse<Review>['meta'] | null>(null);
  protected loading = signal(false);
  protected error = signal(false);
  protected editingId = signal<string | null>(null);
  protected editRating = signal(0);
  protected editComment = signal('');
  protected confirmDeleteId = signal<string | null>(null);
  protected toastMessage = signal<string | null>(null);
  protected toastType = signal<'success' | 'error'>('success');

  private currentPage = signal(1);

  ngOnInit(): void {
    this.loadReviews();
  }

  protected loadReviews(): void {
    this.loading.set(true);
    this.error.set(false);

    this.reviewsApi.getMyReviews(this.currentPage(), 10)
      .pipe(
        catchError(() => {
          this.error.set(true);
          this.loading.set(false);
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.reviews.set(res.data);
          this.pagination.set(res.meta);
        }
        this.loading.set(false);
      });
  }

  protected statusLabel(status: string): string {
    switch (status) {
      case 'PUBLISHED': return 'Publicada';
      case 'HIDDEN': return 'Oculta';
      case 'REMOVED': return 'Removida';
      default: return status;
    }
  }

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
    ];
    return `${day} de ${months[date.getMonth()]}, ${date.getFullYear()}`;
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadReviews();
  }

  // ── Edit ──

  protected startEdit(review: Review): void {
    this.editingId.set(review.id);
    this.editRating.set(review.rating);
    this.editComment.set(review.comment ?? '');
  }

  protected setEditRating(rating: number): void {
    this.editRating.set(rating);
  }

  protected onEditCommentInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.editComment.set(target.value);
  }

  protected saveEdit(reviewId: string): void {
    this.reviewsApi.updateReview(reviewId, {
      rating: this.editRating(),
      comment: this.editComment(),
    })
      .pipe(
        catchError(() => {
          this.showToast('Erro ao atualizar avaliação. Tente novamente.', 'error');
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.editingId.set(null);
          this.showToast('Avaliação atualizada', 'success');
          this.loadReviews();
        }
      });
  }

  protected cancelEdit(review: Review): void {
    this.editingId.set(null);
    this.editRating.set(review.rating);
    this.editComment.set(review.comment ?? '');
  }

  // ── Delete ──

  protected confirmDelete(review: Review): void {
    this.confirmDeleteId.set(review.id);
  }

  protected cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  protected executeDelete(reviewId: string): void {
    this.confirmDeleteId.set(null);

    this.reviewsApi.deleteReview(reviewId)
      .pipe(
        catchError(() => {
          this.showToast('Erro ao excluir avaliação. Tente novamente.', 'error');
          return of(null);
        }),
      )
      .subscribe(() => {
        this.showToast('Avaliação excluída', 'success');
        this.loadReviews();
      });
  }

  // ── Toast ──

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }
}
