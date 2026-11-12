import { Component, Input } from '@angular/core';

/** Small "Saved" message, created at runtime by SavedMessageService. */
@Component({
  selector: 'app-saved-message',
  template: `<div class="message" data-test="saved-message">✓ {{ text }}</div>`,
  styles: [`.message { padding: 8px 16px; border-radius: 4px; background: #2e7d32; color: #fff;
                       box-shadow: 0 2px 6px rgba(0,0,0,.25); }`]
})
export class SavedMessageComponent {
  @Input() text = '';
}
