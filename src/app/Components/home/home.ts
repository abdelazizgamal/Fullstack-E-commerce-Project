import { Component, ElementRef, ViewChild, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category, Product } from '../../Interfaces/product.model';
import { productServices } from '../../services/productServices';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  @ViewChild('productsSlider') productsSlider?: ElementRef<HTMLDivElement>;

  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);
  isLoading = signal(true);

  readonly heroImage =
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80';

  readonly categoryFallbackImage =
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=80';

  readonly featuredProducts = computed(() => this.products().slice(0, 12));

  constructor(private productService: productServices) {
    this.loadData();
  }

  private loadData() {
    this.productService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (e) => console.error('Error loading categories:', e),
    });

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: (e) => {
        console.error('Error loading products:', e);
        this.isLoading.set(false);
      },
    });
  }

  slideProducts(direction: 'left' | 'right') {
    if (!this.productsSlider?.nativeElement) return;
    const amount = direction === 'left' ? -420 : 420;
    this.productsSlider.nativeElement.scrollBy({ left: amount, behavior: 'smooth' });
  }

  trackByCategory(index: number, category: Category) {
    return category.id;
  }

  trackByProduct(index: number, product: Product) {
    return product.id;
  }
}
