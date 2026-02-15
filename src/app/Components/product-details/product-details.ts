import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
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
export class ProductDetails implements OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(productServices);

  product = signal<Product | null>(null);
  selectedImageIndex = signal(0);
  quantity = signal(1);
  isAdding = signal(false);
  addedFeedback = signal('');
  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);
  private addStateTimer: ReturnType<typeof setTimeout> | null = null;
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  readonly maxQuantity = computed(() => {
    const stock = this.product()?.stock ?? 0;
    return Math.max(1, stock);
  });

  readonly subtotal = computed(() => {
    const prod = this.product();
    if (!prod) return 0;
    return prod.price * this.quantity();
  });

  readonly hasRelatedProducts = computed(() => this.relatedProducts().length > 0);
  readonly isSignedIn = computed(() => !!localStorage.getItem('currentUser'));

  readonly galleryImages = computed(() => {
    const prod = this.product();
    if (!prod) return [];

    return this.extractProductImages(prod).map((src) => ({
      src,
      objectPosition: 'center',
    }));
  });

  readonly currentGalleryImage = computed(() => {
    const images = this.galleryImages();
    if (images.length === 0) return null;
    const safeIndex = Math.min(this.selectedImageIndex(), images.length - 1);
    return images[safeIndex];
  });

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
        this.selectedImageIndex.set(0);
        this.loadRelatedProducts(prod.categoryId);
      } else {
        this.router.navigate(['/products']);
      }
    });
  }

  private extractProductImages(prod: Product): string[] {
    const maybeProduct = prod as Product & {
      images?: string[];
      gallery?: string[];
      media?: { images?: string[] };
    };
    const candidates = [
      prod.image,
      ...(maybeProduct.images ?? []),
      ...(maybeProduct.gallery ?? []),
      ...(maybeProduct.media?.images ?? []),
    ];
    return Array.from(
      new Set(
        candidates
          .filter((src): src is string => !!src && typeof src === 'string')
          .map((src) => src.trim())
          .filter((src) => src.length > 0),
      ),
    );
  }

  selectImage(index: number) {
    if (index < 0 || index >= this.galleryImages().length) return;
    this.selectedImageIndex.set(index);
  }

  prevImage() {
    const total = this.galleryImages().length;
    if (total < 2) return;
    this.selectedImageIndex.update((i) => (i - 1 + total) % total);
  }

  nextImage() {
    const total = this.galleryImages().length;
    if (total < 2) return;
    this.selectedImageIndex.update((i) => (i + 1) % total);
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
    this.quantity.update((q) => Math.min(this.maxQuantity(), q + 1));
  }

  decrement() {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  setQuantity(next: number) {
    const safeNext = Number.isNaN(next) ? 1 : next;
    const bounded = Math.max(1, Math.min(this.maxQuantity(), safeNext));
    this.quantity.set(bounded);
  }

  addToCart() {
    const prod = this.product();
    if (!this.isSignedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    if (!prod || prod.stock === 0 || this.isAdding()) return;
    this.isAdding.set(true);
    console.log('Add to cart:', prod, this.quantity());
    if (this.addStateTimer) clearTimeout(this.addStateTimer);
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
    this.addStateTimer = setTimeout(() => {
      this.isAdding.set(false);
      this.addedFeedback.set(`Added ${this.quantity()} item(s)`);
      this.feedbackTimer = setTimeout(() => this.addedFeedback.set(''), 1800);
    }, 450);
  }

  goBack() {
    this.router.navigate(['/products']);
  }

  ngOnDestroy() {
    if (this.addStateTimer) clearTimeout(this.addStateTimer);
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
  }
}
