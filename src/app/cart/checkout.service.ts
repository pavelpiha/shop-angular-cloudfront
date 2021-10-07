import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CartService } from './cart.service';

// import { ProductCheckout } from '../products/product.interface';
import { ProductCheckout } from '../products/product.model';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  constructor(private readonly cartService: CartService) {}

  getProductsForCheckout(): Observable<ProductCheckout[]> {
    return this.cartService.cart$.pipe(
      map((cart) =>
        cart.items.map((item) => ({
          ...item.product,
          orderedCount: item.count,
          totalPrice: +(item.count * item.product.price).toFixed(2),
        }))
      )
    );
  }
}
