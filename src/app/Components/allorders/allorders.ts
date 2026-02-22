import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { Users } from '../../services/users';
import { NgFor, NgIf } from '@angular/common';
import { forkJoin } from 'rxjs';

declare var simpleDatatables: any;
@Component({
  selector: 'app-allorders',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './allorders.html',
  styleUrl: './allorders.css',
})
export class Allorders {

  AllOrders: any[] = [];
  users:any[] = [];
  products:any[] = [];
  productItems:any[] = [];
  constructor(
    private usersService: Users,
    private cdn: ChangeDetectorRef,
  ) {}

  getUserName(userId: string | number): string {
  const user = this.users.find(u => u.id.toString() === userId.toString());
  return user ? user.fullName : 'Unknown User';
  }
  
  getProductName(productId: string | number): string {
    const product = this.products.find(p => p.id.toString() === productId.toString());
    return product ? product.name : 'Unknown Product';
  }
  
getProductItemquantity(orderId: string | number): string {
    const productItem = this.productItems.find(pi => pi.orderId.toString() === orderId.toString());
    return productItem ? productItem.quantity.toString() : 'Unknown Quantity';
  }



  ngOnInit() {
    forkJoin({
      users: this.usersService.get_user(),
      orders: this.usersService.get_orders(),
      products: this.usersService.get_products(),
      productItems: this.usersService.get_product_items()
    }).subscribe(({ users, orders, products, productItems }) => {
      this.users = users;
      this.AllOrders = orders;
      this.products = products;
      this.productItems = productItems;
      this.cdn.detectChanges();

      // Initialize DataTable after data is loaded
      if (typeof simpleDatatables !== 'undefined') {
        new simpleDatatables.DataTable('#default-table', {
          searchable: false,
          perPageSelect: false
        });
      }
    });
  } 
 
}
