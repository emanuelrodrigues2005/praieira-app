import { TestBed } from '@angular/core/testing';
import { RatingStarsComponent } from './rating-stars.component';

describe('RatingStarsComponent', () => {
  it('should render 5 stars with 3 filled for rating 3', async () => {
    const fixture = TestBed.createComponent(RatingStarsComponent);
    fixture.componentRef.setInput('rating', 3);
    fixture.detectChanges();
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('★');
    expect(text).toContain('☆');
    // 3 filled + 2 empty = 5 total characters
    const filledCount = (text.match(/★/g) || []).length;
    const emptyCount = (text.match(/☆/g) || []).length;
    expect(filledCount).toBe(3);
    expect(emptyCount).toBe(2);
  });
});
