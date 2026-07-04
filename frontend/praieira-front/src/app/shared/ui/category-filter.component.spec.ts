import { TestBed } from '@angular/core/testing';
import { CategoryFilterComponent } from './category-filter.component';

describe('CategoryFilterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryFilterComponent],
    }).compileComponents();
  });

  it('should render default category chips', () => {
    const fixture = TestBed.createComponent(CategoryFilterComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const chips = el.querySelectorAll('[data-testid="category-chip"]');
    expect(chips.length).toBeGreaterThan(0);
    expect(chips[0].textContent?.trim()).toBeTruthy();
  });

  it('should render provided categories', () => {
    const fixture = TestBed.createComponent(CategoryFilterComponent);
    fixture.componentRef.setInput('categories', ['Restaurante', 'Quiosque']);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const chips = el.querySelectorAll('[data-testid="category-chip"]');
    expect(chips.length).toBe(2);
    expect(chips[0].textContent?.trim()).toBe('Restaurante');
    expect(chips[1].textContent?.trim()).toBe('Quiosque');
  });

  it('should highlight the selected category', () => {
    const fixture = TestBed.createComponent(CategoryFilterComponent);
    fixture.componentRef.setInput('categories', ['Restaurante', 'Quiosque']);
    fixture.componentRef.setInput('selectedCategory', 'Restaurante');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const chips = el.querySelectorAll('[data-testid="category-chip"]');
    expect(chips[0].classList.contains('active')).toBe(true);
    expect(chips[1].classList.contains('active')).toBe(false);
  });

  it('should emit categoryChange when a chip is clicked', () => {
    const fixture = TestBed.createComponent(CategoryFilterComponent);
    fixture.componentRef.setInput('categories', ['Restaurante', 'Quiosque']);
    fixture.detectChanges();

    let emitted: string | undefined;
    fixture.componentInstance.categoryChange.subscribe((v: string) => (emitted = v));

    const el = fixture.nativeElement as HTMLElement;
    const chips = el.querySelectorAll('[data-testid="category-chip"]');
    (chips[1] as HTMLElement).click();

    expect(emitted).toBe('Quiosque');
  });

  it('should emit empty string when the active chip is clicked again (deselect)', () => {
    const fixture = TestBed.createComponent(CategoryFilterComponent);
    fixture.componentRef.setInput('categories', ['Restaurante', 'Quiosque']);
    fixture.componentRef.setInput('selectedCategory', 'Restaurante');
    fixture.detectChanges();

    let emitted: string | undefined;
    fixture.componentInstance.categoryChange.subscribe((v: string) => (emitted = v));

    const el = fixture.nativeElement as HTMLElement;
    const chips = el.querySelectorAll('[data-testid="category-chip"]');
    (chips[0] as HTMLElement).click();

    expect(emitted).toBe('');
  });
});
