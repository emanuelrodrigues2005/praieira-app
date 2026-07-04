import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { AppShellComponent } from './app-shell.component';
import { AuthStore } from '../auth/auth.store';

@Component({ template: '', standalone: true })
class StubMapComponent {}

@Component({ template: '', standalone: true })
class StubSearchComponent {}

describe('AppShellComponent', () => {
  let authStore: AuthStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppShellComponent,
        RouterTestingModule.withRoutes([
          { path: 'explorar', component: StubSearchComponent },
          { path: 'explorar/mapa', component: StubMapComponent },
        ]),
      ],
    }).compileComponents();
    authStore = TestBed.inject(AuthStore);
  });

  it('should render sidebar navigation with Início, Buscar, Mapa', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll('.sidebar-nav a');
    const linkArray = Array.from(links).map((a) => ({
      text: (a as HTMLAnchorElement).textContent?.trim(),
      href: (a as HTMLAnchorElement).getAttribute('routerLink'),
    }));

    expect(linkArray.some((l) => l.text === 'Início' && l.href === '/')).toBe(true);
    expect(linkArray.some((l) => l.text === 'Buscar' && l.href === '/explorar')).toBe(true);
    expect(linkArray.some((l) => l.text === 'Mapa' && l.href === '/explorar/mapa')).toBe(true);
  });

  it('should not show auth-only links when not authenticated', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll('.sidebar-nav a');
    const linkArray = Array.from(links).map((a) => ({
      text: (a as HTMLAnchorElement).textContent?.trim(),
      href: (a as HTMLAnchorElement).getAttribute('routerLink'),
    }));

    expect(linkArray.some((l) => l.href === '/minha-conta')).toBe(false);
    expect(linkArray.some((l) => l.href === '/favoritos')).toBe(false);
    expect(linkArray.some((l) => l.href === '/minhas-reviews')).toBe(false);
  });

  it('should show auth-only links when authenticated', () => {
    authStore.login(
      { sub: 'u1', role: 'TOURIST', email: 't@t.com' },
      'token',
      'refresh',
    );
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll('.sidebar-nav a');
    const linkArray = Array.from(links).map((a) => ({
      text: (a as HTMLAnchorElement).textContent?.trim(),
      href: (a as HTMLAnchorElement).getAttribute('routerLink'),
    }));

    expect(linkArray.some((l) => l.text === 'Minha Conta' && l.href === '/minha-conta')).toBe(true);
    expect(linkArray.some((l) => l.text === 'Favoritos' && l.href === '/favoritos')).toBe(true);
    expect(linkArray.some((l) => l.text === 'Minhas Reviews' && l.href === '/minhas-reviews')).toBe(true);
  });

  it('should hide sidebar when navigating to /explorar/mapa', async () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/explorar/mapa');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.sidebar')).toBeFalsy();
    expect(el.querySelector('.content')?.classList.contains('map-content')).toBe(true);
  });

  it('should show sidebar when navigating to /explorar', async () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/explorar');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.sidebar')).toBeTruthy();
  });
});
