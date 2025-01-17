import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product, ProductCheckout } from '../../products/product.model';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss'],
})
export class OrderSummaryComponent {
  @Input() products!: ProductCheckout[];
  @Input() showControls!: boolean;
  @Input() totalPrice!: number;

  /** Add productId */
  @Output() add = new EventEmitter<Product>();
  /** Remove productId */
  @Output() remove = new EventEmitter<Product>();
}
