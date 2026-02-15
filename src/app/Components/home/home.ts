import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
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
export class Home implements AfterViewInit, OnDestroy {
  @ViewChild('productsSlider') productsSlider?: ElementRef<HTMLDivElement>;

  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);
  isLoading = signal(true);
  canScrollLeft = signal(false);
  canScrollRight = signal(false);

  private resizeHandler = () => this.updateSliderControls();
  private scrollHandler?: () => void;

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
        setTimeout(() => this.updateSliderControls());
      },
      error: (e) => {
        console.error('Error loading products:', e);
        this.isLoading.set(false);
      },
    });
  }

  ngAfterViewInit(): void {
    const slider = this.productsSlider?.nativeElement;
    if (!slider) return;

    let ticking = false;
    this.scrollHandler = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        this.updateSliderControls();
        ticking = false;
      });
    };

    slider.addEventListener('scroll', this.scrollHandler, { passive: true });
    window.addEventListener('resize', this.resizeHandler, { passive: true });
    setTimeout(() => this.updateSliderControls());
  }

  ngOnDestroy(): void {
    const slider = this.productsSlider?.nativeElement;
    if (slider && this.scrollHandler) {
      slider.removeEventListener('scroll', this.scrollHandler);
    }
    window.removeEventListener('resize', this.resizeHandler);
  }

  slideProducts(direction: 'left' | 'right') {
    if (!this.productsSlider?.nativeElement) return;

    const slider = this.productsSlider.nativeElement;
    const firstCard = slider.querySelector('div') as HTMLDivElement | null;
    const gap = Number.parseFloat(getComputedStyle(slider).columnGap || getComputedStyle(slider).gap || '20');
    const cardWidth = firstCard?.getBoundingClientRect().width || 320;
    const singleStep = cardWidth + gap;
    const cardsPerView = Math.max(1, Math.floor(slider.clientWidth / singleStep));
    const amount = singleStep * cardsPerView;

    slider.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }

  private updateSliderControls(): void {
    const slider = this.productsSlider?.nativeElement;
    if (!slider) return;

    const maxScrollLeft = slider.scrollWidth - slider.clientWidth - 2;
    this.canScrollLeft.set(slider.scrollLeft > 2);
    this.canScrollRight.set(slider.scrollLeft < maxScrollLeft);
  }

  trackByCategory(index: number, category: Category) {
    return category.id;
  }

  trackByProduct(index: number, product: Product) {
    return product.id;
  }
}
