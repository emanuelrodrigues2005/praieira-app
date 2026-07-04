import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { AppShellComponent } from './app-shell.component';

@Component({ template: '', standalone: true })
class StubMapComponent {}

@Component({ template: '', standalone: true })
class StubSearchComponent {}

describe('AppShellComponent', () => {
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
  });

  it('should render sidebar navigation with Minha Conta link', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll('.sidebar-nav a');
    const linkArray = Array.from(links).map((a) => ({
      text: (a as HTMLAnchorElement).textContent?.trim(),
      href: (a as HTMLAnchorElement).getAttribute('routerLink'),
    }));

    expect(linkArray.some((l) => l.text === 'Minha Conta' && l.href === '/minha-conta')).toBe(true);
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
