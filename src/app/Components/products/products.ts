import { Component, OnInit, signal, computed } from '@angular/core';
import { ProductCard } from '../product-card/product-card';
import { productServices } from '../../services/productServices';
import { Product, Category } from '../../Interfaces/product.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCard],
  templateUrl: './products.html',
  styleUrls: ['./products.css'],
})
export class Products implements OnInit {
  // Signals
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  selectedCategory = signal<number | null>(null);
  selectedSort = signal<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  showFilters = signal(false);

  constructor(
    private productService: productServices,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: (data) => this.products.set(data),
      error: (e) => console.error('Error fetching products:', e),
    });

    this.productService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (e) => console.error('Error fetching categories:', e),
    });

    this.route.queryParamMap.subscribe((params) => {
      const categoryParam = params.get('category');
      if (!categoryParam) {
        this.selectedCategory.set(null);
        return;
      }

      const categoryId = Number(categoryParam);
      this.selectedCategory.set(Number.isNaN(categoryId) ? null : categoryId);
    });
  }

  // Computed filtered products
  filteredProducts = computed(() => {
    let result = [...this.products()];
    const selCat = this.selectedCategory();

    // Filter by category
    if (selCat !== null) {
      result = result.filter((p) => p.categoryId === selCat);
    }

    // Sort
    switch (this.selectedSort()) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return result;
  });

  // Computed category name
  selectedCategoryName = computed(() => {
    if (this.selectedCategory() === null) return 'All Products';
    const category = this.categories().find((c) => c.id === this.selectedCategory());
    return category ? category.name : 'All Products';
  });

  // Handlers
  setCategory(id: number | null) {
    this.selectedCategory.set(id);
  }

  setSort(sort: 'featured' | 'price-asc' | 'price-desc' | 'rating') {
    this.selectedSort.set(sort);
  }

  toggleFilters() {
    this.showFilters.update((v) => !v);
  }

  // trackBy for performance
  trackById(index: number, item: Product) {
    return item.id;
  }
}
