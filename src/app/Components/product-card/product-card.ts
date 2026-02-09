import { Component, Input, computed, input, signal } from '@angular/core';
import { Category, Product } from '../../Core/Interfaces/product.model';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  product = input<Product | null>(null);
  @Input() categories: Category[] = [];

  readonly categoryName = computed(() => {
    if (!this.product()?.categoryId || this.categories.length === 0) {
      return '';
    }
    const cat = this.categories.find((c) => c.id === this.product()!.categoryId);
    return cat?.name || '';
  });

  categoryFolder(id: number): string {
    switch (id) {
      case 1:
        return 'Electronics';
      case 2:
        return 'Clothing';
      case 3:
        return 'Home Appliances';
      case 4:
        return 'Books';
      case 5:
        return 'Sports';
      case 6:
        return 'Toys';
      default:
        return '';
    }
  }

  addToCart(product: Product | null) {
    if (!product) return;
  }
}
