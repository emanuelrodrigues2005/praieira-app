import { Component, ChangeDetectionStrategy, signal, inject, DestroyRef } from '@angular/core';
import { Router, RouterModule, Event, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="app-shell" [class.map-mode]="hideSidebar()">
      @if (!hideSidebar()) {
        <aside class="sidebar">
          <nav class="sidebar-nav">
            <div class="logo">Praieira</div>
            <a routerLink="/" routerLinkActive="active">Início</a>
            <a routerLink="/explorar" routerLinkActive="active">Buscar</a>
            <a routerLink="/explorar/mapa" routerLinkActive="active">Mapa</a>
            <a routerLink="/favoritos" routerLinkActive="active">Favoritos</a>
            <a routerLink="/minhas-reviews" routerLinkActive="active">Minhas Reviews</a>
            <a routerLink="/minha-conta" routerLinkActive="active">Minha Conta</a>
          </nav>
        </aside>
      }
      <main class="content" [class.map-content]="hideSidebar()">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-shell { display: flex; min-height: 100vh; }
    .app-shell.map-mode { display: block; }
    .sidebar { width: 240px; background: #fffdf7; border-right: 1px solid #e0e0e0; padding: 1rem; display: flex; flex-direction: column; }
    .sidebar-nav { display: flex; flex-direction: column; gap: 0.5rem; }
    .logo { font-size: 1.5rem; font-weight: bold; margin-bottom: 2rem; color: #00a8e8; }
    .sidebar a { padding: 0.75rem 1rem; text-decoration: none; color: #04303a; border-radius: 6px; }
    .sidebar a:hover { background: #fff8ee; }
    .sidebar a.active { background: #00c2ff; color: white; }
    .content { flex: 1; padding: 1.5rem; background: #fffdf7; }
    .content.map-content { padding: 0; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected hideSidebar = signal(false);

  constructor() {
    this.updateSidebarVisibility(this.router.url);
    this.router.events
      .pipe(filter((e: Event): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event) => this.updateSidebarVisibility(event.urlAfterRedirects));
  }

  private updateSidebarVisibility(url: string): void {
    this.hideSidebar.set(url.startsWith('/explorar/mapa'));
  }
}
