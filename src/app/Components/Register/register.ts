import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Users } from '../../services/users';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  // import { Users } from './../../services/users';
templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  constructor(private userService: Users, private router: Router) {}

  // NEW: Loading + Error state
  isLoading = false;
  serverError: string | null = null;

  showCountryDropdown = false;

  countries: string[] = ['Egypt', 'Saudi Arabia', 'UAE', 'Kuwait', 'Qatar'];

  flag = true;

  signupForm = new FormGroup({
    fullName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^[a-zA-Z\s]+$/),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    country: new FormControl('', [Validators.required]),
    city: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[a-zA-Z\s]+$/),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  selectedCountry: string | null = null;

  toggleCountryDropdown() {
    this.showCountryDropdown = !this.showCountryDropdown;
  }

  selectCountry(country: string) {
    this.selectedCountry = country;
    this.showCountryDropdown = false;
    this.signupForm.patchValue({ country: country });
  }

  showPassword = false;
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  showPassword2 = false;
  togglePassword2() {
    this.showPassword2 = !this.showPassword2;
  }

  // ================================
  // Validation getters (UNCHANGED)
  // ================================

  get fullNameErrors() {
    const control = this.signupForm.get('fullName');
    if (control?.touched && control?.invalid) {
      if (control.errors?.['required']) return 'Full name is required';
      if (control.errors?.['minlength'])
        return 'Name must be at least 3 characters';
      if (control.errors?.['pattern'])
        return 'Name can only contain letters';
    }
    return null;
  }

  get emailErrors() {
    const control = this.signupForm.get('email');
    if (control?.touched && control?.invalid) {
      if (control.errors?.['required']) return 'Email is required';
      if (control.errors?.['email'])
        return 'Please enter a valid email address';
    }
    return null;
  }

  get countryErrors() {
    const control = this.signupForm.get('country');
    if (control?.touched && control?.invalid) {
      if (control.errors?.['required']) return 'Please select a country';
    }
    return null;
  }

  get cityErrors() {
    const control = this.signupForm.get('city');
    if (control?.touched && control?.invalid) {
      if (control.errors?.['required']) return 'City is required';
      if (control.errors?.['pattern'])
        return 'City can only contain letters';
    }
    return null;
  }

  get passwordErrors() {
    const control = this.signupForm.get('password');
    if (control?.touched && control?.invalid) {
      if (control.errors?.['required']) return 'Password is required';
      if (control.errors?.['minlength'])
        return 'Password must be at least 6 characters';
    }
    return null;
  }

  get confirmPasswordErrors() {
    const control = this.signupForm.get('confirmPassword');
    if (control?.touched && control?.invalid) {
      if (control.errors?.['required'])
        return 'Please confirm your password';
    }

    const password = this.signupForm.get('password')?.value;
    const confirmPassword = control?.value;

    if (control?.touched && password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  }

  // ================================
  // UPDATED SIGNUP FLOW
  // ================================
  onSubmit() {
    this.signupForm.markAllAsTouched();
    this.serverError = null;

    if (this.signupForm.invalid) return;

    const password = this.signupForm.get('password')?.value;
    const confirmPassword = this.signupForm.get('confirmPassword')?.value;

    if (password !== confirmPassword) return;

    if (this.isLoading) return; // prevent double submit
    this.isLoading = true;

    const formValue = this.signupForm.value;
    const email = formValue.email?.toLowerCase().trim() || '';

    // 1️⃣ Check if email exists
    this.userService.getUserByEmail(email).subscribe({
      next: (users: any[]) => {
        if (users.length > 0) {
          this.serverError = 'Email already exists';
          this.isLoading = false;
          return;
        }

        // 2️⃣ Transform to user object
        const newUser = {
          fullName: formValue.fullName!,
          email: email!,
          password: formValue.password!,
          role: "user",
          address: {
            country: formValue.country!,
            city: formValue.city!,
          },
          createdAt: new Date().toISOString(),
        };

        // 3️⃣ Create user
        this.userService.createUser(newUser).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/login']); // redirect after success
          },
          error: () => {
            this.serverError = 'Signup failed. Try again.';
            this.isLoading = false;
          },
        });
      },
      error: () => {
        this.serverError = 'Server error. Try again.';
        this.isLoading = false;
      },
    });
  }
}
