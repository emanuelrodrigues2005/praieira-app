import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { catchError, finalize, of } from 'rxjs';
import { CatalogApiService } from '../../core/http/catalog-api.service';
import { ReviewsApiService } from '../../core/http/reviews-api.service';
import { AuthStore } from '../../core/auth/auth.store';
import { WorkerProfile, Review, ReviewSummary } from '../../core/models';
import { RatingStarsComponent } from '../../shared/ui/rating-stars.component';
import { ProfileStatusBadgeComponent } from '../../shared/ui/profile-status-badge.component';

@Component({
  selector: 'app-worker-detail',
  standalone: true,
  imports: [RouterModule, DatePipe, RatingStarsComponent, ProfileStatusBadgeComponent],
  template: `
    <div class="detail-page" data-testid="detail-page">
      @if (loading()) {
        <!-- Loading Skeleton -->
        <div class="skeleton-container" data-testid="detail-skeleton">
          <div class="skeleton-hero"></div>
          <div class="skeleton-section">
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-40"></div>
            <div class="skeleton-line w-80"></div>
          </div>
          <div class="skeleton-section">
            <div class="skeleton-line w-50"></div>
            <div class="skeleton-line w-70"></div>
          </div>
          <div class="skeleton-section">
            <div class="skeleton-line w-45"></div>
            <div class="skeleton-line w-65"></div>
          </div>
        </div>
      } @else if (error()) {
        <!-- Error State -->
        <div class="error-state" data-testid="error-state">
          <p class="error-text">Não foi possível carregar o perfil.</p>
          <button class="btn-retry" data-testid="retry-btn" (click)="loadProfile()">Tentar novamente</button>
        </div>
      } @else if (notFound()) {
        <!-- Not Found State -->
        <div class="not-found-state" data-testid="not-found-state">
          <p class="error-text">Estabelecimento não encontrado</p>
          <a class="btn-retry" routerLink="/explorar">Voltar para busca</a>
        </div>
      } @else if (profile()) {
        @let p = profile()!;

        <!-- Breadcrumb -->
        <nav class="breadcrumb" data-testid="breadcrumb">
          <a routerLink="/" class="breadcrumb-link">Início</a>
          <span class="breadcrumb-sep">&gt;</span>
          <a routerLink="/explorar" class="breadcrumb-link">Busca</a>
          <span class="breadcrumb-sep">&gt;</span>
          <span class="breadcrumb-current">{{ p.name }}</span>
        </nav>

        <!-- Hero Section -->
        <section class="hero-section" data-testid="hero-section">
          @if (p.coverImage) {
            <img [src]="p.coverImage" [alt]="p.name" class="cover-image" />
          } @else {
            <div class="cover-placeholder"></div>
          }
          <div class="hero-overlay">
            <h1 class="hero-name" data-testid="hero-name">{{ p.name }}</h1>
            <span class="hero-category" data-testid="hero-category">{{ p.category }}</span>
            <span class="hero-location" data-testid="hero-location">📍 {{ p.beach }}</span>
            <div class="hero-rating" data-testid="hero-rating">
              <app-rating-stars [rating]="p.averageRating ?? 0" />
              <span class="rating-value">{{ (p.averageRating ?? 0).toFixed(1) }}</span>
              <span class="rating-count">({{ p.totalReviews ?? 0 }} avaliações)</span>
            </div>
          </div>
        </section>

        <!-- Profile Info Section -->
        <section class="info-section" data-testid="info-section">
          <div class="info-grid">
            <div class="info-card">
              <span class="info-label">Status</span>
              <app-profile-status-badge [status]="p.status" data-testid="status-badge" />
              <span class="info-value" data-testid="status-text">{{ isOpen() ? 'Aberto' : 'Fechado' }}</span>
            </div>
            <div class="info-card">
              <span class="info-label">Localização</span>
              <span class="info-value" data-testid="info-location">📍 {{ p.beach }}</span>
            </div>
            <div class="info-card">
              <span class="info-label">Categoria</span>
              <span class="info-value" data-testid="info-category">{{ p.category }}</span>
            </div>
            <div class="info-card">
              <span class="info-label">Avaliação</span>
              <div class="info-rating" data-testid="info-rating">
                <app-rating-stars [rating]="p.averageRating ?? 0" />
                <span class="rating-value">{{ (p.averageRating ?? 0).toFixed(1) }}</span>
                <span class="rating-count">({{ p.totalReviews ?? 0 }})</span>
              </div>
            </div>
          </div>
          @if (p.tags && p.tags.length > 0) {
            <div class="tags-section" data-testid="tags-section">
              @for (tag of p.tags; track tag) {
                <span class="tag-pill">{{ tag }}</span>
              }
            </div>
          }
        </section>

        <!-- Description Section -->
        @if (p.description) {
          <section class="description-section" data-testid="description-section">
            <h2 class="section-title">Sobre</h2>
            <p class="description-text" data-testid="description-text">{{ p.description }}</p>
          </section>
        }

        <!-- Services Section -->
        @if (p.services && p.services.length > 0) {
          <section class="services-section" data-testid="services-section">
            <h2 class="section-title">Serviços</h2>
            <div class="services-grid">
              @for (service of p.services; track service.id) {
                <div class="service-card" data-testid="service-card">
                  <h3 class="service-title" data-testid="service-title">{{ service.title }}</h3>
                  @if (service.description) {
                    <p class="service-description" data-testid="service-description">{{ service.description }}</p>
                  }
                  <div class="service-footer">
                    @if (service.price != null) {
                      <span class="service-price" data-testid="service-price">R$ {{ service.price.toFixed(2) }}</span>
                    }
                    <span class="service-availability" [class.available]="service.isAvailable" data-testid="service-availability">
                      {{ service.isAvailable ? 'Disponível' : 'Indisponível' }}
                    </span>
                  </div>
                </div>
              }
            </div>
          </section>
        }

        <!-- Contact Buttons -->
        <section class="contact-section" data-testid="contact-section">
          <div class="contact-buttons">
            @if (p.whatsapp) {
              <button class="btn-whatsapp" data-testid="btn-whatsapp" (click)="onWhatsAppClick()">
                💬 Fale pelo WhatsApp
              </button>
            }
            @if (p.phone) {
              <button class="btn-phone" data-testid="btn-phone" (click)="onPhoneClick()">
                📞 Ligar agora
              </button>
            }
          </div>
        </section>

        <!-- Confirmation Modal -->
        @if (showContactModal()) {
          <div class="modal-overlay" data-testid="contact-modal" (click)="closeContactModal()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <h3 class="modal-title">{{ contactModalTitle() }}</h3>
              <p class="modal-text">{{ contactModalMessage() }}</p>
              <div class="modal-actions">
                <button class="btn-cancel" data-testid="modal-cancel-btn" (click)="closeContactModal()">Cancelar</button>
                <button class="btn-confirm" data-testid="modal-confirm-btn" (click)="confirmRedirect()">Ir agora</button>
              </div>
            </div>
          </div>
        }

        <!-- Reviews Section -->
        <section class="reviews-section" data-testid="reviews-section">
          <h2 class="section-title">Avaliações</h2>
          @if (reviewsLoading()) {
            <div class="reviews-skeleton">Carregando avaliações...</div>
          } @else {
            @if (reviewSummary()) {
              @let rs = reviewSummary()!;
              <div class="reviews-summary" data-testid="reviews-summary">
                <div class="summary-average">
                  <span class="summary-average-number" data-testid="summary-average">{{ rs.averageRating.toFixed(1) }}</span>
                  <app-rating-stars [rating]="rs.averageRating" />
                  <span class="summary-total" data-testid="summary-total">{{ rs.totalReviews }} avaliações</span>
                </div>
                <div class="summary-distribution" data-testid="summary-distribution">
                  @for (star of [5, 4, 3, 2, 1]; track star) {
                    <div class="distribution-row">
                      <span class="distribution-label">{{ star }}★</span>
                      <div class="distribution-bar-bg">
                        <div class="distribution-bar-fill" [style.width.%]="distributionPercent(rs, star)"></div>
                      </div>
                      <span class="distribution-count">{{ distributionCount(rs, star) }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            @if (reviews().length > 0) {
              <div class="reviews-list" data-testid="reviews-list">
                @for (review of reviews(); track review.id) {
                  <div class="review-card" data-testid="review-card">
                    <div class="review-header">
                      <span class="review-author" data-testid="review-author">{{ review.touristName ?? 'Anônimo' }}</span>
                      <app-rating-stars [rating]="review.rating" />
                    </div>
                    <span class="review-date" data-testid="review-date">{{ review.createdAt | date:'dd/MM/yyyy' }}</span>
                    @if (review.comment) {
                      <p class="review-comment" data-testid="review-comment">{{ review.comment }}</p>
                    }
                  </div>
                }
              </div>
              @if (hasMoreReviews()) {
                <button class="btn-load-more" data-testid="load-more-btn" (click)="loadMoreReviews()">
                  Carregar mais avaliações
                </button>
              }
            } @else {
              <p class="reviews-empty" data-testid="reviews-empty">Nenhuma avaliação ainda.</p>
            }

            @if (authStore.isAuthenticated() && authStore.role() === 'TOURIST') {
              <a class="btn-review" routerLink="./avaliar" data-testid="btn-review">
                Avaliar
              </a>
            }
          }
        </section>

        <!-- Photo Gallery -->
        @if (p.gallery && p.gallery.length > 0) {
          <section class="gallery-section" data-testid="gallery-section">
            <h2 class="section-title">Galeria</h2>
            <div class="gallery-grid">
              @for (img of p.gallery; track img; let i = $index) {
                <img
                  [src]="img"
                  [alt]="'Foto ' + (i + 1)"
                  class="gallery-thumb"
                  data-testid="gallery-thumb"
                  (click)="openGallery(i)"
                />
              }
            </div>
          </section>
        }

        <!-- Gallery Lightbox -->
        @if (galleryIndex() !== null && p.gallery && p.gallery.length > 0) {
          <div class="modal-overlay" data-testid="gallery-lightbox" (click)="closeGallery()">
            <div class="lightbox-content" (click)="$event.stopPropagation()">
              <button class="lightbox-nav lightbox-prev" data-testid="lightbox-prev" (click)="prevGalleryImage($event)">‹</button>
              <img [src]="p.gallery[galleryIndex()!]" alt="Foto" class="lightbox-image" />
              <button class="lightbox-nav lightbox-next" data-testid="lightbox-next" (click)="nextGalleryImage($event)">›</button>
              <button class="lightbox-close" data-testid="lightbox-close" (click)="closeGallery()">✕</button>
            </div>
          </div>
        }

        <!-- Mini-map -->
        <section class="map-section" data-testid="map-section">
          <h2 class="section-title">Localização</h2>
          <div class="mini-map" data-testid="mini-map">
            <div class="map-pin">📍</div>
            <p class="map-coords">{{ p.latitude.toFixed(4) }}, {{ p.longitude.toFixed(4) }}</p>
            <a
              class="map-link"
              data-testid="map-link"
              [href]="'https://www.google.com/maps?q=' + p.latitude + ',' + p.longitude"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver no mapa →
            </a>
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .detail-page { max-width: 960px; margin: 0 auto; padding-bottom: 2rem; }

    /* ── Breadcrumb ── */
    .breadcrumb { font-size: 13px; color: #97a0a6; margin-bottom: 0.5rem; }
    .breadcrumb-link { color: #00a8e8; text-decoration: none; }
    .breadcrumb-link:hover { text-decoration: underline; }
    .breadcrumb-sep { margin: 0 0.5rem; }
    .breadcrumb-current { color: #073642; }

    /* ── Hero ── */
    .hero-section {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 1.5rem;
      min-height: 240px;
      background: linear-gradient(135deg, #e0f4fd, #b3e5fc);
    }
    .cover-image { width: 100%; height: 280px; object-fit: cover; display: block; }
    .cover-placeholder { height: 280px; background: linear-gradient(135deg, #e0f4fd, #b3e5fc); }
    .hero-overlay {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      padding: 1.5rem;
      background: linear-gradient(transparent, rgba(0,0,0,0.7));
      display: flex; flex-direction: column; gap: 0.25rem;
    }
    .hero-name { color: #fff; font-size: 1.75rem; font-weight: 700; margin: 0; }
    .hero-category { color: rgba(255,255,255,.85); font-size: 0.9rem; font-weight: 600; }
    .hero-location { color: rgba(255,255,255,.75); font-size: 0.85rem; }
    .hero-rating { display: flex; align-items: center; gap: 0.35rem; margin-top: 0.25rem; }
    .hero-rating .rating-value { color: #ffb74d; font-weight: 700; font-size: 1rem; }
    .hero-rating .rating-count { color: rgba(255,255,255,.7); font-size: 0.85rem; }

    /* ── Info Section ── */
    .info-section {
      background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 8px;
      padding: 1.25rem; margin-bottom: 1.25rem;
    }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 1rem; }
    .info-card { display: flex; flex-direction: column; gap: 0.25rem; }
    .info-label { font-size: 0.75rem; font-weight: 700; color: #97a0a6; text-transform: uppercase; letter-spacing: .05em; }
    .info-value { font-size: 0.9rem; color: #073642; font-weight: 600; }
    .info-rating { display: flex; align-items: center; gap: 0.35rem; }
    .info-rating .rating-value { color: #073642; font-weight: 700; font-size: 0.9rem; }
    .info-rating .rating-count { color: #97a0a6; font-size: 0.8rem; }
    .tags-section { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,.06); }
    .tag-pill { padding: 0.3rem 0.75rem; border-radius: 12px; background: #fff8ee; color: #073642; font-size: 0.8rem; font-weight: 600; }

    /* ── Description ── */
    .description-section { margin-bottom: 1.25rem; }
    .section-title { font-size: 1.25rem; font-weight: 700; color: #073642; margin: 0 0 0.75rem; }
    .description-text { font-size: 0.9rem; color: #555; line-height: 1.6; margin: 0; }

    /* ── Services ── */
    .services-section { margin-bottom: 1.25rem; }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 0.75rem; }
    .service-card {
      background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 8px;
      padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem;
    }
    .service-title { font-size: 1rem; font-weight: 700; color: #073642; margin: 0; }
    .service-description { font-size: 0.85rem; color: #666; margin: 0; line-height: 1.4; }
    .service-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
    .service-price { font-size: 1rem; font-weight: 700; color: #00a8e8; }
    .service-availability { font-size: 0.8rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 6px; background: #f5f5f5; color: #999; }
    .service-availability.available { background: #e8f5e9; color: #2e7d32; }

    /* ── Contact ── */
    .contact-section { margin-bottom: 1.25rem; }
    .contact-buttons { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .btn-whatsapp {
      padding: 0.75rem 1.5rem; background: #25D366; color: #fff; border: none;
      border-radius: 8px; font-size: 0.95rem; font-weight: 700; cursor: pointer;
      transition: background 0.2s;
    }
    .btn-whatsapp:hover { background: #1ebe5d; }
    .btn-phone {
      padding: 0.75rem 1.5rem; background: #00a8e8; color: #fff; border: none;
      border-radius: 8px; font-size: 0.95rem; font-weight: 700; cursor: pointer;
      transition: background 0.2s;
    }
    .btn-phone:hover { background: #0096c7; }

    /* ── Modal ── */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.5);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal-content {
      background: #fff; border-radius: 12px; padding: 1.5rem;
      max-width: 400px; width: 90%;
    }
    .modal-title { font-size: 1.1rem; font-weight: 700; color: #073642; margin: 0 0 0.5rem; }
    .modal-text { font-size: 0.9rem; color: #555; margin: 0 0 1.25rem; line-height: 1.4; }
    .modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
    .btn-cancel {
      padding: 0.5rem 1rem; background: #f5f5f5; color: #666; border: none;
      border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
    }
    .btn-cancel:hover { background: #e0e0e0; }
    .btn-confirm {
      padding: 0.5rem 1rem; background: #00a8e8; color: #fff; border: none;
      border-radius: 6px; font-size: 0.85rem; font-weight: 700; cursor: pointer;
    }
    .btn-confirm:hover { background: #0096c7; }

    /* ── Reviews ── */
    .reviews-section { margin-bottom: 1.25rem; }
    .reviews-skeleton { padding: 1rem; color: #97a0a6; font-size: 0.9rem; }
    .reviews-summary {
      background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 8px;
      padding: 1.25rem; margin-bottom: 1rem; display: flex; gap: 2rem; flex-wrap: wrap;
    }
    .summary-average { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; min-width: 120px; }
    .summary-average-number { font-size: 2.5rem; font-weight: 700; color: #073642; line-height: 1; }
    .summary-total { font-size: 0.85rem; color: #97a0a6; }
    .summary-distribution { flex: 1; min-width: 180px; display: flex; flex-direction: column; gap: 0.35rem; }
    .distribution-row { display: flex; align-items: center; gap: 0.5rem; }
    .distribution-label { font-size: 0.8rem; color: #073642; min-width: 28px; }
    .distribution-bar-bg {
      flex: 1; height: 8px; background: #eee; border-radius: 4px; overflow: hidden;
    }
    .distribution-bar-fill { height: 100%; background: #ffb74d; border-radius: 4px; transition: width 0.3s; }
    .distribution-count { font-size: 0.8rem; color: #97a0a6; min-width: 20px; text-align: right; }
    .reviews-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
    .review-card {
      background: #fff; border: 1px solid rgba(0,0,0,.06); border-radius: 8px;
      padding: 1rem; display: flex; flex-direction: column; gap: 0.25rem;
    }
    .review-header { display: flex; align-items: center; gap: 0.5rem; }
    .review-author { font-weight: 700; color: #073642; font-size: 0.9rem; }
    .review-date { font-size: 0.8rem; color: #97a0a6; }
    .review-comment { font-size: 0.85rem; color: #555; margin: 0.25rem 0 0; line-height: 1.4; }
    .btn-load-more {
      display: block; width: 100%; padding: 0.6rem; background: #f5f5f5; color: #073642;
      border: 1px solid rgba(0,0,0,.08); border-radius: 8px; font-size: 0.85rem; font-weight: 600;
      cursor: pointer; margin-bottom: 1rem;
    }
    .btn-load-more:hover { background: #e0e0e0; }
    .reviews-empty { color: #97a0a6; font-size: 0.9rem; margin-bottom: 1rem; }
    .btn-review {
      display: inline-block; padding: 0.6rem 1.25rem; background: #ffb74d; color: #073642;
      border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 700; cursor: pointer;
      text-decoration: none;
    }
    .btn-review:hover { background: #ffa726; }

    /* ── Gallery ── */
    .gallery-section { margin-bottom: 1.25rem; }
    .gallery-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(150px,1fr));
      gap: 0.5rem;
    }
    .gallery-thumb {
      width: 100%; height: 120px; object-fit: cover; border-radius: 6px;
      cursor: pointer; transition: transform 0.2s;
    }
    .gallery-thumb:hover { transform: scale(1.03); }
    .lightbox-content {
      position: relative; display: flex; align-items: center; gap: 0.5rem;
    }
    .lightbox-image { max-width: 80vw; max-height: 80vh; border-radius: 8px; }
    .lightbox-nav {
      background: rgba(255,255,255,.9); border: none; border-radius: 50%;
      width: 40px; height: 40px; font-size: 1.5rem; cursor: pointer; display: flex;
      align-items: center; justify-content: center; color: #073642; font-weight: 700;
    }
    .lightbox-nav:hover { background: #fff; }
    .lightbox-close {
      position: absolute; top: -2rem; right: 0;
      background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer;
    }

    /* ── Mini-map ── */
    .map-section { margin-bottom: 1.25rem; }
    .mini-map {
      background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 8px;
      padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
      text-align: center;
    }
    .map-pin { font-size: 2rem; }
    .map-coords { font-size: 0.85rem; color: #97a0a6; margin: 0; }
    .map-link { font-size: 0.9rem; color: #00a8e8; font-weight: 600; text-decoration: none; }
    .map-link:hover { text-decoration: underline; }

    /* ── Error / Not Found / Skeleton ── */
    .error-state, .not-found-state {
      text-align: center; padding: 3rem 1rem;
    }
    .error-text { font-size: 1rem; color: #c62828; margin-bottom: 1rem; }
    .btn-retry {
      display: inline-block; padding: 0.5rem 1rem; background: #00a8e8; color: #fff;
      border: none; border-radius: 6px; font-size: 0.9rem; font-weight: 700; cursor: pointer;
      text-decoration: none;
    }
    .btn-retry:hover { background: #0096c7; }
    .skeleton-container { padding: 1rem 0; }
    .skeleton-hero {
      height: 240px; background: linear-gradient(135deg, #e0e0e0 25%, #f5f5f5 50%, #e0e0e0 75%);
      background-size: 200% 100%; animation: shimmer 1.5s infinite;
      border-radius: 12px; margin-bottom: 1.5rem;
    }
    .skeleton-section { margin-bottom: 1.25rem; }
    .skeleton-line {
      height: 14px; background: #e0e0e0; border-radius: 4px; margin-bottom: 0.5rem;
      animation: pulse 1.5s infinite;
    }
    .skeleton-line.w-40 { width: 40%; }
    .skeleton-line.w-45 { width: 45%; }
    .skeleton-line.w-50 { width: 50%; }
    .skeleton-line.w-60 { width: 60%; }
    .skeleton-line.w-65 { width: 65%; }
    .skeleton-line.w-70 { width: 70%; }
    .skeleton-line.w-80 { width: 80%; }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkerDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogApi = inject(CatalogApiService);
  private readonly reviewsApi = inject(ReviewsApiService);
  protected readonly authStore = inject(AuthStore);

  protected readonly profile = signal<WorkerProfile | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly notFound = signal(false);

  // Reviews state
  protected readonly reviewSummary = signal<ReviewSummary | null>(null);
  protected readonly reviews = signal<Review[]>([]);
  protected readonly reviewsLoading = signal(true);
  protected reviewsPage = 1;
  protected reviewsTotalPages = 1;

  // Contact modal
  protected readonly showContactModal = signal(false);
  protected readonly contactModalTitle = signal('');
  protected readonly contactModalMessage = signal('');
  private pendingContactUrl = '';

  // Gallery
  protected readonly galleryIndex = signal<number | null>(null);

  ngOnInit(): void {
    this.loadProfile();
  }

  protected loadProfile(): void {
    this.loading.set(true);
    this.error.set(false);
    this.notFound.set(false);

    const workerId = this.route.snapshot.paramMap.get('id');
    if (!workerId) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    this.catalogApi.getWorker(workerId).pipe(
      catchError((err) => {
        if (err.status === 404) {
          this.notFound.set(true);
        } else {
          this.error.set(true);
        }
        this.loading.set(false);
        return of(null);
      }),
    ).subscribe((res) => {
      if (res) {
        this.profile.set(res.data);
        this.loading.set(false);
        this.loadReviews(workerId);
      }
    });
  }

  private loadReviews(workerId: string): void {
    this.reviewsLoading.set(true);

    this.reviewsApi.getSummary(workerId).pipe(
      catchError(() => of(null)),
    ).subscribe((res) => {
      if (res) {
        this.reviewSummary.set(res.data);
      }
    });

    this.reviewsApi.getReviews(workerId, 1, 5).pipe(
      catchError(() => of(null)),
      finalize(() => this.reviewsLoading.set(false)),
    ).subscribe((res) => {
      if (res) {
        this.reviews.set(res.data);
        this.reviewsPage = res.meta.page;
        this.reviewsTotalPages = res.meta.totalPages;
      }
    });
  }

  protected loadMoreReviews(): void {
    const workerId = this.route.snapshot.paramMap.get('id');
    if (!workerId) return;

    const nextPage = this.reviewsPage + 1;
    this.reviewsApi.getReviews(workerId, nextPage, 5).pipe(
      catchError(() => of(null)),
    ).subscribe((res) => {
      if (res) {
        this.reviews.update((prev) => [...prev, ...res.data]);
        this.reviewsPage = res.meta.page;
        this.reviewsTotalPages = res.meta.totalPages;
      }
    });
  }

  protected hasMoreReviews(): boolean {
    return this.reviewsPage < this.reviewsTotalPages;
  }

  protected distributionPercent(summary: ReviewSummary, star: number): number {
    if (summary.totalReviews === 0) return 0;
    return ((summary.distribution[star] ?? 0) / summary.totalReviews) * 100;
  }

  protected distributionCount(summary: ReviewSummary, star: number): number {
    return summary.distribution[star] ?? 0;
  }

  protected isOpen(): boolean {
    const p = this.profile();
    if (!p?.businessHours) return true;

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = days[now.getDay()];
    const hours = p.businessHours[dayKey];
    if (!hours) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = hours.open.split(':').map(Number);
    const [closeH, closeM] = hours.close.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  // ── Contact ──

  protected onWhatsAppClick(): void {
    const p = this.profile();
    if (!p?.whatsapp) return;

    const workerId = this.route.snapshot.paramMap.get('id') ?? '';

    this.reviewsApi.registerContact(workerId, 'whatsapp').pipe(
      catchError(() => of(null)),
    ).subscribe(() => {
      const number = p.whatsapp!.replace(/\D/g, '');
      this.pendingContactUrl = `https://wa.me/${number}`;
      this.contactModalTitle.set('WhatsApp');
      this.contactModalMessage.set('Você será redirecionado ao WhatsApp');
      this.showContactModal.set(true);
    });
  }

  protected onPhoneClick(): void {
    const p = this.profile();
    if (!p?.phone) return;

    const workerId = this.route.snapshot.paramMap.get('id') ?? '';

    this.reviewsApi.registerContact(workerId, 'phone').pipe(
      catchError(() => of(null)),
    ).subscribe(() => {
      this.pendingContactUrl = `tel:${p.phone}`;
      this.contactModalTitle.set('Ligação');
      this.contactModalMessage.set('Você está prestes a realizar uma ligação');
      this.showContactModal.set(true);
    });
  }

  protected closeContactModal(): void {
    this.showContactModal.set(false);
    this.pendingContactUrl = '';
  }

  protected confirmRedirect(): void {
    if (this.pendingContactUrl) {
      window.open(this.pendingContactUrl, '_blank');
    }
    this.closeContactModal();
  }

  // ── Gallery ──

  protected openGallery(index: number): void {
    this.galleryIndex.set(index);
  }

  protected closeGallery(): void {
    this.galleryIndex.set(null);
  }

  protected prevGalleryImage(event: MouseEvent): void {
    event.stopPropagation();
    const p = this.profile();
    if (!p?.gallery?.length || this.galleryIndex() === null) return;
    this.galleryIndex.set((this.galleryIndex()! - 1 + p.gallery.length) % p.gallery.length);
  }

  protected nextGalleryImage(event: MouseEvent): void {
    event.stopPropagation();
    const p = this.profile();
    if (!p?.gallery?.length || this.galleryIndex() === null) return;
    this.galleryIndex.set((this.galleryIndex()! + 1) % p.gallery.length);
  }
}
