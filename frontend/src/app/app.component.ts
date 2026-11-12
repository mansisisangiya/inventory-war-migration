import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { SavedMessageService } from './saved-message/saved-message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  /** Where the "Saved" message is inserted at runtime. */
  @ViewChild('messageHost', { read: ViewContainerRef, static: true }) messageHost!: ViewContainerRef;

  constructor(private savedMessage: SavedMessageService) {}

  ngOnInit(): void {
    this.savedMessage.setHost(this.messageHost);
  }
}
