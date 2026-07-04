import { TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();
  });

  it('should render page numbers', () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('page', 1);
    fixture.componentRef.setInput('totalPages', 5);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const pageBtns = el.querySelectorAll('[data-testid="page-btn"]');
    expect(pageBtns.length).toBe(5);
    expect(pageBtns[0].textContent?.trim()).toBe('1');
    expect(pageBtns[4].textContent?.trim()).toBe('5');
  });

  it('should highlight the current page', () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('page', 3);
    fixture.componentRef.setInput('totalPages', 5);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const pageBtns = el.querySelectorAll('[data-testid="page-btn"]');
    expect(pageBtns[2].classList.contains('active')).toBe(true);
    expect(pageBtns[0].classList.contains('active')).toBe(false);
  });

  it('should emit pageChange when a page number is clicked', () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('page', 1);
    fixture.componentRef.setInput('totalPages', 5);
    fixture.detectChanges();

    let emitted: number | undefined;
    fixture.componentInstance.pageChange.subscribe((v: number) => (emitted = v));

    const el = fixture.nativeElement as HTMLElement;
    const pageBtns = el.querySelectorAll('[data-testid="page-btn"]');
    (pageBtns[3] as HTMLElement).click();

    expect(emitted).toBe(4);
  });

  it('should render "Anterior" button disabled on first page', () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('page', 1);
    fixture.componentRef.setInput('totalPages', 5);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const prevBtn = el.querySelector('[data-testid="prev-btn"]') as HTMLButtonElement;
    expect(prevBtn).toBeTruthy();
    expect(prevBtn.disabled).toBe(true);
    expect(prevBtn.textContent?.trim().toLowerCase()).toContain('anterior');
  });

  it('should render "Próximo" button disabled on last page', () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('page', 5);
    fixture.componentRef.setInput('totalPages', 5);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const nextBtn = el.querySelector('[data-testid="next-btn"]') as HTMLButtonElement;
    expect(nextBtn).toBeTruthy();
    expect(nextBtn.disabled).toBe(true);
    expect(nextBtn.textContent?.trim().toLowerCase()).toContain('próximo');
  });

  it('should not render anything when totalPages <= 1', () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('page', 1);
    fixture.componentRef.setInput('totalPages', 1);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.children.length).toBe(0);
  });

  it('should emit pageChange - 1 when "Anterior" is clicked', () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('page', 3);
    fixture.componentRef.setInput('totalPages', 5);
    fixture.detectChanges();

    let emitted: number | undefined;
    fixture.componentInstance.pageChange.subscribe((v: number) => (emitted = v));

    const el = fixture.nativeElement as HTMLElement;
    const prevBtn = el.querySelector('[data-testid="prev-btn"]') as HTMLButtonElement;
    prevBtn.click();

    expect(emitted).toBe(2);
  });

  it('should emit pageChange + 1 when "Próximo" is clicked', () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('page', 3);
    fixture.componentRef.setInput('totalPages', 5);
    fixture.detectChanges();

    let emitted: number | undefined;
    fixture.componentInstance.pageChange.subscribe((v: number) => (emitted = v));

    const el = fixture.nativeElement as HTMLElement;
    const nextBtn = el.querySelector('[data-testid="next-btn"]') as HTMLButtonElement;
    nextBtn.click();

    expect(emitted).toBe(4);
  });
});
