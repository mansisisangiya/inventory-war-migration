import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ItemService } from './item.service';
import { Item } from './item.model';

describe('ItemService', () => {
  let service: ItemService;
  let http: HttpTestingController;
  const bolts: Item = { id: 1, name: 'Steel bolts', quantity: 540, price: 0.12 };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ItemService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getAll() loads the item list', () => {
    let result: Item[] = [];
    service.getAll().subscribe(items => result = items);
    http.expectOne('api/items').flush([bolts]);
    expect(result).toEqual([bolts]);
  });

  it('getById() returns a promise (toPromise)', async () => {
    const promise = service.getById(1);
    http.expectOne('api/items/1').flush(bolts);
    expect(await promise).toEqual(bolts);
  });
});
