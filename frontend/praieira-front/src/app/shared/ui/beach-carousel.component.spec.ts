import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { BeachCarouselComponent } from './beach-carousel.component';

describe('BeachCarouselComponent', () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeachCarouselComponent, RouterTestingModule],
    }).compileComponents();
    router = TestBed.inject(Router);
  });

  it('should render 4 beach cards', () => {
    const fixture = TestBed.createComponent(BeachCarouselComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const cards = el.querySelectorAll('[data-testid="beach-card"]');
    expect(cards.length).toBe(4);

    const beaches = ['Gaibu', 'Porto de Galinhas', 'Praia dos Carneiros', 'Boa Viagem'];
    cards.forEach((card, i) => {
      expect(card.textContent).toContain(beaches[i]);
    });
  });

  it('should navigate to /explorar with beach param when a card is clicked', () => {
    const fixture = TestBed.createComponent(BeachCarouselComponent);
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');

    const el = fixture.nativeElement as HTMLElement;
    const firstCard = el.querySelectorAll('[data-testid="beach-card"]')[0] as HTMLElement;
    firstCard.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/explorar'], { queryParams: { beach: 'Gaibu' } });
  });

  it('should display establishment count for each beach', () => {
    const fixture = TestBed.createComponent(BeachCarouselComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const counts = el.querySelectorAll('[data-testid="beach-count"]');
    expect(counts.length).toBe(4);
    counts.forEach((count) => {
      expect(count.textContent).toMatch(/\d+/);
    });
  });
});
