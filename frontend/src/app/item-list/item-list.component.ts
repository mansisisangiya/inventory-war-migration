import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { Item } from '../item.model';
import { ItemService } from '../item.service';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent {
  readonly columns = ['name', 'quantity', 'price', 'edit'];
  readonly items$: Observable<Item[]> = this.itemService.getAll();

  constructor(private itemService: ItemService) {}
}
