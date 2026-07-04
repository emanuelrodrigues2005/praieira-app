import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { WorkerCardComponent } from './worker-card.component';
import { WorkerProfileSearchResult } from '../../core/http/catalog-api.service';

describe('WorkerCardComponent', () => {
  let router: Router;

  const mockWorker: WorkerProfileSearchResult = {
    id: 'w1',
    name: 'Barraca do João',
    category: 'Restaurante',
    beach: 'Gaibu',
    latitude: -8.289,
    longitude: -34.948,
    phone: '81999999999',
    whatsapp: '81999999999',
    description: 'Comida típica e petiscos',
    coverImage: null,
    gallery: [],
    tags: ['peixe', 'praia'],
    businessHours: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkerCardComponent, RouterTestingModule],
    }).compileComponents();
    router = TestBed.inject(Router);
  });

  it('should render worker name, category, and beach', () => {
    const fixture = TestBed.createComponent(WorkerCardComponent);
    fixture.componentRef.setInput('worker', mockWorker);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Barraca do João');
    expect(el.textContent).toContain('Restaurante');
    expect(el.textContent).toContain('Gaibu');
  });

  it('should render image placeholder when coverImage is null', () => {
    const fixture = TestBed.createComponent(WorkerCardComponent);
    fixture.componentRef.setInput('worker', mockWorker);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const imgPlaceholder = el.querySelector('[data-testid="worker-image"]');
    expect(imgPlaceholder).toBeTruthy();
    expect(imgPlaceholder?.textContent).toContain('🏪');
  });

  it('should show "Ver perfil" button that navigates to /perfil/:id', () => {
    const fixture = TestBed.createComponent(WorkerCardComponent);
    fixture.componentRef.setInput('worker', mockWorker);
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');

    const el = fixture.nativeElement as HTMLElement;
    const button = el.querySelector('[data-testid="view-profile-btn"]') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.textContent?.toLowerCase()).toContain('ver perfil');

    button.click();
    expect(navigateSpy).toHaveBeenCalledWith(['/perfil', 'w1']);
  });

  it('should render rating stars from input', () => {
    const fixture = TestBed.createComponent(WorkerCardComponent);
    fixture.componentRef.setInput('worker', { ...mockWorker, averageRating: 4.2, totalReviews: 15 });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    // Should render star-filled content
    const starsEl = el.querySelector('[data-testid="rating"]');
    expect(starsEl).toBeTruthy();
    expect(starsEl?.textContent).toContain('★');
    expect(starsEl?.textContent).toContain('4.2');
    expect(starsEl?.textContent).toContain('15');
  });
});
