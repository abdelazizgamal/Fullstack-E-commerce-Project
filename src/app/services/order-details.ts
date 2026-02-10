import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class OrderDetailsService {
  private apiUrl = 'http://localhost:3000';

  order = signal<any | null>(null);
  items = signal<any[]>([]);

  constructor(private http: HttpClient) {}

  loadOrder(orderId: string) {
    // 1️⃣ Load order
    this.http
      .get<any>(`${this.apiUrl}/orders/${orderId}`)
      .subscribe(order => {
        this.order.set(order);

        // 2️⃣ Load order items
        this.http
          .get<any[]>(`${this.apiUrl}/orderItems?orderId=${orderId}`)
          .subscribe(items => {

            // 3️⃣ Load products
            this.http
              .get<any[]>(`${this.apiUrl}/products`)
              .subscribe(products => {
                const enrichedItems = items.map(item => ({
                  ...item,
                  product: products.find(p => String(p.id) === String(item.productId))
                }));

                this.items.set(enrichedItems);
              });
          });
      });
  }
}
