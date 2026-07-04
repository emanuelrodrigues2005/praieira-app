import { TestBed } from '@angular/core/testing';
import { BeachSelectorComponent } from './beach-selector.component';

describe('BeachSelectorComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeachSelectorComponent],
    }).compileComponents();
  });

  it('should render a select with all beaches plus "Todas as praias" option', () => {
    const fixture = TestBed.createComponent(BeachSelectorComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const select = el.querySelector('select') as HTMLSelectElement;
    expect(select).toBeTruthy();

    // "Todas as praias" + 4 beaches
    expect(select.options.length).toBe(5);
    expect(select.options[0].value).toBe('');
    expect(select.options[0].textContent?.trim()).toBe('Todas as praias');
  });

  it('should reflect the selectedBeach input', () => {
    const fixture = TestBed.createComponent(BeachSelectorComponent);
    fixture.componentRef.setInput('selectedBeach', 'Gaibu');
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedBeach).toBe('Gaibu');
  });

  it('should default to empty string when no beach is selected', () => {
    const fixture = TestBed.createComponent(BeachSelectorComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedBeach).toBe('');
  });

  it('should emit beachChange when a different beach is selected', () => {
    const fixture = TestBed.createComponent(BeachSelectorComponent);
    fixture.componentRef.setInput('selectedBeach', '');
    fixture.detectChanges();

    let emitted: string | undefined;
    fixture.componentInstance.beachChange.subscribe((v: string) => (emitted = v));

    const el = fixture.nativeElement as HTMLElement;
    const select = el.querySelector('select') as HTMLSelectElement;
    select.value = 'Porto de Galinhas';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(emitted).toBe('Porto de Galinhas');
  });

  it('should emit empty string when "Todas as praias" is selected', () => {
    const fixture = TestBed.createComponent(BeachSelectorComponent);
    fixture.componentRef.setInput('selectedBeach', 'Gaibu');
    fixture.detectChanges();

    let emitted: string | undefined;
    fixture.componentInstance.beachChange.subscribe((v: string) => (emitted = v));

    const el = fixture.nativeElement as HTMLElement;
    const select = el.querySelector('select') as HTMLSelectElement;
    select.value = '';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(emitted).toBe('');
  });
});
