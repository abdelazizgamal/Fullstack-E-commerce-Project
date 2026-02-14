import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  categoryId: number;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  product?: Product;
  categoryName?: string;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
}

export interface Toast {
  id: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = 'http://localhost:3000';
  private userId = 1;
  private toastCounter = 0;

  readonly cart = signal<Cart | null>(null);
  readonly products = signal<Product[]>([]);
  readonly toasts = signal<Toast[]>([]);

  readonly taxRate = 0.1;
  readonly shippingCost = 0;

  readonly subtotal = computed(() =>
    this.cart()?.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0) || 0
  );

  readonly total = computed(() =>
    this.subtotal() + this.subtotal() * this.taxRate + this.shippingCost
  );

  constructor(private http: HttpClient) {}

  loadCart() {
    this.http.get<Product[]>(`${this.apiUrl}/products`).subscribe(products => {
      // Convert IDs to number
      const numericProducts = products.map(p => ({ ...p, id: Number(p.id), categoryId: Number(p.categoryId) }));
      this.products.set(numericProducts);

      this.http.get<any[]>(`${this.apiUrl}/categories`).subscribe(categories => {
        const categoryMap = new Map<number, string>();
        categories.forEach(c => categoryMap.set(Number(c.id), c.name));

        // Load cart for user
        this.http.get<Cart[]>(`${this.apiUrl}/carts?userId=${this.userId}`).subscribe(carts => {
          let cartId: number;
          if (carts.length === 0) {
            // Create new cart if none exists
            this.http.post<Cart>(`${this.apiUrl}/carts`, { userId: this.userId }).subscribe(newCart => {
              cartId = Number(newCart.id);
              this.cart.set({ id: cartId, userId: this.userId, items: [] });
            });
            return;
          }

          cartId = Number(carts[0].id);

          // Load cartItems
          this.http.get<CartItem[]>(`${this.apiUrl}/cartItems?cartId=${cartId}`).subscribe(cartItems => {
            const enrichedItems: CartItem[] = cartItems.map(item => {
              const prod = numericProducts.find(p => p.id === Number(item.productId));
              return {
                ...item,
                id: Number(item.id),
                cartId: Number(item.cartId),
                productId: Number(item.productId),
                quantity: Number(item.quantity),
                product: prod,
                categoryName: prod ? categoryMap.get(prod.categoryId) : undefined
              };
            });

            this.cart.set({
              id: cartId,
              userId: this.userId,
              items: enrichedItems
            });
          });
        });
      });
    });
  }

  private syncCart(cart: Cart) {
    cart.items.forEach(item => {
      this.http.patch(`${this.apiUrl}/cartItems/${item.id}`, {
        quantity: item.quantity
      }).subscribe({
        next: () => console.log(`  Updated cartItem ${item.id}`),
        error: err => console.error(`  Failed to update cartItem ${item.id}`, err)
      });
    });
  }

  increaseQuantity(item: CartItem) {
    if (!item.product) return;
    if (item.quantity + 1 > item.product.stock) {
      this.showToast(`Only ${item.product.stock} ${item.product.name}(s) in stock`);
      return;
    }
    const cart = this.cart();
    if (!cart) return;
    item.quantity++;
    this.cart.set({ ...cart });
    this.syncCart(cart);
  }

  decreaseQuantity(item: CartItem) {
    const cart = this.cart();
    if (!cart) return;

    if (item.quantity <= 1) {
      this.removeItem(item);
      return;
    }

    item.quantity--;
    this.cart.set({ ...cart });
    this.syncCart(cart);
  }

  removeItem(item: CartItem) {
    const cart = this.cart();
    if (!cart) return;

    const updatedCart: Cart = {
      ...cart,
      items: cart.items.filter(i => i.productId !== item.productId)
    };
    this.cart.set(updatedCart);

    if (item.id) {
      this.http.delete(`${this.apiUrl}/cartItems/${item.id}`).subscribe();
    }

    this.showToast(`${item.product?.name} removed from cart`);
  }

checkout(): Promise<string> {
  const cart = this.cart();
  if (!cart || cart.items.length === 0) {
    return Promise.reject('Cart empty');
  }

  return new Promise(resolve => {
    this.http.get<any[]>(`${this.apiUrl}/orders`).subscribe(orders => {

      const lastId =
        orders.length > 0
          ? Math.max(...orders.map(o => Number(o.id)))
          : 0;

      const newOrderId = String(lastId + 1);

      const orderPayload = {
        id: newOrderId,
        userId: String(this.userId),
        total: this.total(),
        status: 'Pending',
        createdAt: new Date().toISOString(),
        shippingAddress: {
          country: 'Egypt',
          city: 'Cairo'
        }
      };

      this.http.post(`${this.apiUrl}/orders`, orderPayload).subscribe(() => {

        let completed = 0;

        cart.items.forEach((item, index) => {
          this.http.get<any[]>(`${this.apiUrl}/orderItems`).subscribe(orderItems => {

            const lastItemId =
              orderItems.length > 0
                ? Math.max(...orderItems.map(i => Number(i.id)))
                : 0;

            const newOrderItemId = String(lastItemId + index + 1);

            this.http.post(`${this.apiUrl}/orderItems`, {
              id: newOrderItemId,
              orderId: newOrderId,
              productId: String(item.productId),
              quantity: item.quantity,
              price: item.product?.price
            }).subscribe(() => {
              completed++;

              if (completed === cart.items.length) {
                // clear cart
                cart.items.forEach(i => {
                  this.http.delete(`${this.apiUrl}/cartItems/${i.id}`).subscribe();
                });

                this.cart.set({ ...cart, items: [] });
                this.showToast('Order successfully placed!');

                resolve(newOrderId); // ✅ IMPORTANT
              }
            });
          });
        });
      });
    });
  });
}

  showToast(message: string) {
    const id = ++this.toastCounter;
    this.toasts.update(t => [...t, { id, message }]);
    setTimeout(() => this.toasts.update(t => t.filter(toast => toast.id !== id)), 3000);
  }
}
