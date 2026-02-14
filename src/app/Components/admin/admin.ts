import { ChangeDetectorRef, Component } from '@angular/core';
import { Users } from '../../services/users';

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  num_users: number = 0;
  num_orders: number = 0;
  total_price_orders: number = 0;
  
  constructor(private usersService: Users, private cdn:ChangeDetectorRef) {
   
  }
  ngOnInit() {
  this.usersService.get_user().subscribe((users) => {
    this.num_users = users.length;
    this.cdn.detectChanges();
  });

  this.usersService.get_orders().subscribe((orders: any[]) => {
    this.num_orders = orders.length;

    // Reset total before calculation
    this.total_price_orders = 0;

    orders.forEach((order) => {
      const price = Number(order.total) || 0;
      this.total_price_orders += price;
    });

    this.cdn.detectChanges();
  });
}

}
