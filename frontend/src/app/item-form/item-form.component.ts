import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Item } from '../item.model';
import { ItemService } from '../item.service';
import { SavedMessageService } from '../saved-message/saved-message.service';

/** Add (/items/new) and edit (/items/:id/edit) share this form. */
@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss']
})
export class ItemFormComponent implements OnInit {
  itemId: number | null = null;

  // DEPRECATED style from v14: untyped FormGroup. v14's update renames it to UntypedFormGroup;
  // the typed version is FormGroup<{ name: FormControl<string>, ... }>.
  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required, Validators.min(0)]]
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemService,
    private savedMessage: SavedMessageService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.itemId = Number(id);
      const item = await this.itemService.getById(this.itemId);
      this.form.patchValue(item);
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const item = this.form.value as Item;
    const request = this.itemId === null
      ? this.itemService.create(item)
      : this.itemService.update(this.itemId, item);
    request.subscribe(saved => {
      this.savedMessage.show(`Saved ${saved.name}`);
      this.router.navigate(['/items']);
    });
  }
}
