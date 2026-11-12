import { ComponentFactoryResolver, Injectable, NgZone, ViewContainerRef } from '@angular/core';
import { SavedMessageComponent } from './saved-message.component';

@Injectable({ providedIn: 'root' })
export class SavedMessageService {
  private host?: ViewContainerRef;

  // DEPRECATED in v13: ComponentFactoryResolver. From v13 the component class can be passed
  // straight to ViewContainerRef.createComponent(SavedMessageComponent).
  constructor(private resolver: ComponentFactoryResolver, private zone: NgZone) {}

  setHost(host: ViewContainerRef): void {
    this.host = host;
  }

  show(text: string): void {
    if (!this.host) {
      return;
    }
    const factory = this.resolver.resolveComponentFactory(SavedMessageComponent);
    const ref = this.host.createComponent(factory);
    ref.instance.text = text;
    // Timer runs outside Angular's zone; inside it, Protractor would wait for it on every step.
    this.zone.runOutsideAngular(() => setTimeout(() => this.zone.run(() => ref.destroy()), 3000));
  }
}
