import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-us',
  imports: [FormsModule],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.css',
})
export class ContactUs {
  fullName = '';
  email = '';
  message = '';
  sent = signal(false);

  submit(): void {
    if (!this.fullName || !this.email || !this.message) return;
    this.sent.set(true);
    this.fullName = '';
    this.email = '';
    this.message = '';
    setTimeout(() => this.sent.set(false), 3000);
  }
}
