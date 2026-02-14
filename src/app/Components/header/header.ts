import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { Category } from '../../Core/Interfaces/product.model';
import { CartService } from '../../services/cart';
import { productServices } from '../../services/productServices';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  currentUser: any = null;
  categories: Category[] = [];
  menuOpen = false;

  private subscription = new Subscription();

  constructor(
    private router: Router,
    public cartService: CartService,
    private productService: productServices,
  ) {}

  ngOnInit(): void {
    this.refreshUser();

    this.productService.getCategories().subscribe({
      next: (data) => (this.categories = data || []),
      error: () => (this.categories = []),
    });

    if (this.isLoggedIn) {
      this.cartService.loadCart();
    }

    this.subscription.add(
      this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
        this.refreshUser();

        if (this.isLoggedIn && !this.cartService.cart()) {
          this.cartService.loadCart();
        }

        this.menuOpen = false;
      }),
    );

    window.addEventListener('storage', this.onStorageChange);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    window.removeEventListener('storage', this.onStorageChange);
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  get userName(): string {
    return (
      this.currentUser?.fullName || this.currentUser?.name || this.currentUser?.email || 'User'
    );
  }

  get cartItemsCount(): number {
    return this.cartService.cart()?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.refreshUser();
    this.menuOpen = false;
    this.router.navigate(['/']);
  }

  private refreshUser(): void {
    const userString = localStorage.getItem('currentUser');

    if (!userString) {
      this.currentUser = null;
      return;
    }

    try {
      this.currentUser = JSON.parse(userString);
    } catch {
      this.currentUser = null;
    }
  }

  private onStorageChange = (): void => {
    this.refreshUser();
  };
}
