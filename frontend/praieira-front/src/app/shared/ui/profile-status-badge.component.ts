import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-profile-status-badge',
  standalone: true,
  template: `
    <span class="status-badge" [class]="'status-' + (status?.toLowerCase() || 'draft')">
      {{ status || 'DRAFT' }}
    </span>
  `,
  styles: [`
    .status-badge { padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .status-draft { background: #e0e0e0; color: #666; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-approved { background: #d4edda; color: #155724; }
    .status-rejected { background: #f8d7da; color: #721c24; }
    .status-suspended { background: #343a40; color: #fff; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileStatusBadgeComponent {
  @Input() status: string | null = 'DRAFT';
}
