import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
// import { LucideAngularModule } from 'lucide-angular';
import { ProductCard } from '../product-card/product-card';
import { productServices } from '../../services/productServices';
import { Product, Category } from '../../Interfaces/product.model';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, ProductCard],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(productServices);

  product = signal<Product | null>(null);
  quantity = signal(1);
  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);

  categoryName = computed(() => {
    const prod = this.product();
    if (!prod) return '';
    const cat = this.categories().find((c) => c.id === prod.categoryId);
    return cat ? cat.name : '';
  });

  relatedProducts = computed(() => {
    const prod = this.product();
    if (!prod) return [];
    return this.products()
      .filter((p) => p.categoryId === prod.categoryId && p.id !== prod.id)
      .slice(0, 3);
  });

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/products']);
      return;
    }

    this.productService.getCategories().subscribe((cats) => this.categories.set(cats));

    this.productService.getProductById(id).subscribe((prod) => {
      if (prod) {
        this.product.set(prod);
        this.loadRelatedProducts(prod.categoryId);
      } else {
        this.router.navigate(['/products']);
      }
    });
  }

  private loadRelatedProducts(categoryId: number) {
    this.productService.getProducts().subscribe((allProducts) => {
      const related = allProducts
        .filter((p) => p.categoryId === categoryId)
        .filter((p) => p.id !== this.product()?.id);
      this.products.set(related);
    });
  }

  increment() {
    this.quantity.update((q) => q + 1);
  }

  decrement() {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  addToCart() {
    const prod = this.product();
    if (!prod) return;
    console.log('Add to cart:', prod, this.quantity());
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}
