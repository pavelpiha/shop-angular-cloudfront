import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ApiService } from '../core/api.service';
import { Product } from '../products/product.model';
import { Cart } from './models';

@Injectable({
  providedIn: 'root',
})
export class CartService extends ApiService {
  /** Key - item id, value - ordered amount */
  #cartSource = new BehaviorSubject<Cart>({ id: '', items: [] });

  cart$ = this.#cartSource.asObservable();

  totalInCart$: Observable<number> = this.cart$.pipe(
    map((cart) => cart.items.reduce((count, item) => count + item.count, 0)),
    shareReplay({
      refCount: true,
      bufferSize: 1,
    })
  );

  constructor(protected readonly injector: Injector) {
    super(injector);
    const url = this.getUrl('cart', 'api/profile/cart');
    this.http
      .get<{ data: { cart: Cart } }>(url)
      .subscribe(({ data: { cart } }) => this.#cartSource.next(cart));
  }

  addItem(product: Product): void {
    this.updateCount(product, 1);
  }

  removeItem(product: Product): void {
    this.updateCount(product, -1);
  }

  empty(): void {
    const cart = this.#cartSource.getValue();
    this.#cartSource.next({ id: cart.id, items: [] });
  }

  private updateCount(product: Product, type: 1 | -1): void {
    const { id, items } = this.#cartSource.getValue();
    const cartItem = items.find((item) => item.product.id === product.id);

    if (!cartItem) {
      items.push({ product, count: 1 });
    } else {
      cartItem.count += type;
    }

    if (!this.endpointEnabled('cart')) {
      console.warn(
        'Endpoint "cart" is disabled. To enable change your environment.ts config'
      );
      this.#cartSource.next({ id, items });
      return;
    }

    const body = { id, items };
    const url = this.getUrl('cart', 'api/profile/cart');
    this.http
      .put<{ data: { cart: Cart } }>(url, body)
      .subscribe(({ data: { cart } }) => this.#cartSource.next(cart));
  }
}
