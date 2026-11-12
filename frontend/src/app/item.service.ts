import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';
import { Item } from './item.model';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private readonly url = `${environment.apiBase}/items`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Item[]> {
    return this.http.get<Item[]>(this.url);
  }

  // DEPRECATED in RxJS 7 (Angular 13+), removed in RxJS 8: toPromise().
  // Replacement: firstValueFrom(this.http.get(...)).
  getById(id: number): Promise<Item> {
    return this.http.get<Item>(`${this.url}/${id}`).toPromise();
  }

  create(item: Item): Observable<Item> {
    return this.http.post<Item>(this.url, item);
  }

  update(id: number, item: Item): Observable<Item> {
    return this.http.put<Item>(`${this.url}/${id}`, item);
  }
}
