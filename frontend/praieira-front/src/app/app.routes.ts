import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { AppShellComponent } from './core/layout/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
      { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
      { path: 'cadastro', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
      { path: 'explorar', loadComponent: () => import('./features/catalog/search.component').then(m => m.SearchComponent) },
      { path: 'explorar/mapa', loadComponent: () => import('./features/catalog/map.component').then(m => m.MapComponent) },
      { path: 'perfil/:id', loadComponent: () => import('./features/worker-profile/worker-detail.component').then(m => m.WorkerDetailComponent) },
      { path: 'perfil/:id/avaliar', loadComponent: () => import('./features/reviews/review-form.component').then(m => m.ReviewFormComponent), canActivate: [AuthGuard, RoleGuard], data: { role: 'TOURIST' } },
      { path: 'minhas-reviews', loadComponent: () => import('./features/reviews/my-reviews.component').then(m => m.MyReviewsComponent), canActivate: [AuthGuard, RoleGuard], data: { role: 'TOURIST' } },
      { path: 'favoritos', loadComponent: () => import('./features/favorites/favorites.component').then(m => m.FavoritesComponent), canActivate: [AuthGuard, RoleGuard], data: { role: 'TOURIST' } },
      { path: 'minha-conta', loadComponent: () => import('./features/account/account.component').then(m => m.AccountComponent), canActivate: [AuthGuard] },
      // Entrepreneur routes
      { path: 'empreendedor/cadastro', loadComponent: () => import('./features/entrepreneur-dashboard/wizard.component').then(m => m.EntrepreneurWizardComponent) },
      { path: 'empreendedor/dashboard', loadComponent: () => import('./features/entrepreneur-dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [AuthGuard, RoleGuard], data: { role: 'WORKER' } },
      { path: 'empreendedor/estatisticas', loadComponent: () => import('./features/entrepreneur-dashboard/statistics.component').then(m => m.StatisticsComponent), canActivate: [AuthGuard, RoleGuard], data: { role: 'WORKER' } },
      { path: 'empreendedor/perfil-publico', loadComponent: () => import('./features/entrepreneur-dashboard/public-profile.component').then(m => m.PublicProfileComponent), canActivate: [AuthGuard, RoleGuard], data: { role: 'WORKER' } },
      { path: 'empreendedor/servicos', loadComponent: () => import('./features/entrepreneur-dashboard/services.component').then(m => m.ServicesComponent), canActivate: [AuthGuard, RoleGuard], data: { role: 'WORKER' } },
      { path: 'empreendedor/avaliacoes', loadComponent: () => import('./features/entrepreneur-dashboard/reviews.component').then(m => m.EntrepreneurReviewsComponent), canActivate: [AuthGuard, RoleGuard], data: { role: 'WORKER' } },
      { path: 'empreendedor/notificacoes', loadComponent: () => import('./features/entrepreneur-dashboard/notifications.component').then(m => m.NotificationsComponent), canActivate: [AuthGuard, RoleGuard], data: { role: 'WORKER' } },
      { path: 'empreendedor/configuracoes', loadComponent: () => import('./features/entrepreneur-dashboard/settings.component').then(m => m.SettingsComponent), canActivate: [AuthGuard, RoleGuard], data: { role: 'WORKER' } },
    ],
  },
];
