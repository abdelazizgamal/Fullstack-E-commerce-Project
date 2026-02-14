import { Component, OnInit, signal, computed } from '@angular/core';
import { ProductCard } from '../product-card/product-card';
import { productServices } from '../../services/productServices';
import { Product, Category } from '../../Interfaces/product.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCard],
  templateUrl: './products.html',
  styleUrls: ['./products.css'],
})
export class Products implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  selectedCategory = signal<number | null>(null);
  selectedSort = signal<'featured' | 'price-asc' | 'price-desc'>('featured');
  showFilters = signal(false);
  currentPage = signal(1);

  readonly pageSize = 9;

  constructor(
    private productService: productServices,
    private route: ActivatedRoute,
    private router: Router,
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
      this.currentPage.set(1);
      if (!categoryParam) {
        this.selectedCategory.set(null);
        return;
      }

      const categoryId = Number(categoryParam);
      this.selectedCategory.set(Number.isNaN(categoryId) ? null : categoryId);
    });
  }

  displayCategories = computed(() => {
    const usedCategoryIds = new Set(this.products().map((p) => p.categoryId));
    return this.categories().filter((c) => usedCategoryIds.has(c.id));
  });

  filteredProducts = computed(() => {
    const selected = this.selectedCategory();
    let result = this.products();

    if (selected !== null) {
      result = result.filter((product) => product.categoryId === selected);
    }

    if (this.selectedSort() === 'price-asc') {
      return [...result].sort((a, b) => a.price - b.price);
    }

    if (this.selectedSort() === 'price-desc') {
      return [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  });

  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredProducts().slice(start, start + this.pageSize);
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredProducts().length / this.pageSize)),
  );

  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  selectedCategoryName = computed(() => {
    if (this.selectedCategory() === null) return 'All Products';
    const category = this.categories().find((c) => c.id === this.selectedCategory());
    return category ? category.name : 'All Products';
  });

  setCategory(id: number | null) {
    this.selectedCategory.set(id);
    this.currentPage.set(1);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: id ?? null },
      queryParamsHandling: 'merge',
    });
    if (this.showFilters()) this.showFilters.set(false);
  }

  setSort(sort: 'featured' | 'price-asc' | 'price-desc') {
    this.selectedSort.set(sort);
    this.currentPage.set(1);
  }

  toggleFilters() {
    this.showFilters.update((v) => !v);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage() - 1);
  }

  trackById(index: number, item: Product) {
    return item.id;
  }

  trackByCategoryId(index: number, item: Category) {
    return item.id;
  }
}
