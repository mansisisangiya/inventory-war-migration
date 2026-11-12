import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';

import { ItemService } from '../item.service';
import { SavedMessageService } from '../saved-message/saved-message.service';
import { ItemFormComponent } from './item-form.component';

describe('ItemFormComponent', () => {
  let component: ItemFormComponent;
  let itemService: jasmine.SpyObj<ItemService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    itemService = jasmine.createSpyObj<ItemService>('ItemService', ['getById', 'create', 'update']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: ItemService, useValue: itemService },
        { provide: Router, useValue: router },
        { provide: SavedMessageService, useValue: jasmine.createSpyObj('SavedMessageService', ['show']) },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}) } } }
      ]
    });
    // Template is not rendered: these tests check the form logic only (e2e covers the UI).
    component = new ItemFormComponent(
      TestBed.inject(FormBuilder), TestBed.inject(ActivatedRoute), TestBed.inject(Router),
      TestBed.inject(ItemService), TestBed.inject(SavedMessageService));
  });

  it('is invalid until a name is entered', () => {
    expect(component.form.valid).toBeFalse();
    component.form.patchValue({ name: 'Washers' });
    expect(component.form.valid).toBeTrue();
  });

  it('creates a new item and goes back to the list', () => {
    const item = { name: 'Washers', quantity: 3, price: 0.1 };
    itemService.create.and.returnValue(of({ ...item, id: 5 }));
    component.form.setValue(item);
    component.save();
    expect(itemService.create).toHaveBeenCalledWith(item);
    expect(router.navigate).toHaveBeenCalledWith(['/items']);
  });
});
