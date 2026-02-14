import { Component, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  NonNullableFormBuilder,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { User } from '../../Interfaces/user.model';
import { Users } from './../../services/users';
import { finalize, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

type RegisterForm = {
  fullName: FormControl<string>;
  email: FormControl<string>;
  country: FormControl<string>;
  city: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  signupForm!: FormGroup<RegisterForm>;

  constructor(
    private fb: NonNullableFormBuilder,
    private userService: Users,
    private router: Router,
  ) {
    // ======================
    // NEW: Typed FormGroup
    // ======================

    this.signupForm = this.fb.group({
      fullName: [
        '',
        [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z\s]+$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
      country: ['', Validators.required],
      city: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  // ======================
  // UI State (unchanged)
  // ======================

  showCountryDropdown = false;
  countries: string[] = ['Egypt', 'Saudi Arabia', 'UAE', 'Kuwait', 'Qatar'];
  selectedCountry: string | null = null;

  showPassword = false;
  showPassword2 = false;

  isLoading = signal(false);
  serverError = signal<string | null>(null);

  toggleCountryDropdown() {
    this.showCountryDropdown = !this.showCountryDropdown;
  }

  selectCountry(country: string) {
    this.selectedCountry = country;
    this.showCountryDropdown = false;
    this.signupForm.patchValue({ country });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  togglePassword2() {
    this.showPassword2 = !this.showPassword2;
  }

  // ======================
  // Validation getters (unchanged)
  // ======================

  get fullNameErrors() {
    const control = this.signupForm.controls.fullName;
    if (control.touched && control.invalid) {
      if (control.errors?.['required']) return 'Full name is required';
      if (control.errors?.['minlength']) return 'Name must be at least 3 characters';
      if (control.errors?.['pattern']) return 'Name can only contain letters';
    }
    return null;
  }

  get emailErrors() {
    const control = this.signupForm.controls.email;
    if (control.touched && control.invalid) {
      if (control.errors?.['required']) return 'Email is required';
      if (control.errors?.['email']) return 'Please enter a valid email address';
    }
    return null;
  }

  get countryErrors() {
    const control = this.signupForm.controls.country;
    if (control.touched && control.invalid) {
      if (control.errors?.['required']) return 'Please select a country';
    }
    return null;
  }

  get cityErrors() {
    const control = this.signupForm.controls.city;
    if (control.touched && control.invalid) {
      if (control.errors?.['required']) return 'City is required';
      if (control.errors?.['pattern']) return 'City can only contain letters';
    }
    return null;
  }

  get passwordErrors() {
    const control = this.signupForm.controls.password;
    if (control.touched && control.invalid) {
      if (control.errors?.['required']) return 'Password is required';
      if (control.errors?.['minlength']) return 'Password must be at least 6 characters';
    }
    return null;
  }

  get confirmPasswordErrors() {
    const control = this.signupForm.controls.confirmPassword;

    if (control.touched && control.invalid) {
      if (control.errors?.['required']) return 'Please confirm your password';
    }

    if (control.touched && this.signupForm.controls.password.value !== control.value) {
      return 'Passwords do not match';
    }
    return null;
  }

  // ======================
  // UPDATED SIGNUP FLOW
  // ======================

  onSubmit() {
    this.signupForm.markAllAsTouched();
    this.serverError.set(null);

    if (this.signupForm.invalid) return;

    const formValue = this.signupForm.getRawValue();

    if (formValue.password !== formValue.confirmPassword) return;

    if (this.isLoading()) return;

    this.isLoading.set(true);

    const email = formValue.email.toLowerCase().trim();

    const newUser: User = {
      fullName: formValue.fullName,
      email: email,
      password: formValue.password,
      role: 'user',
      address: {
        country: formValue.country,
        city: formValue.city,
      },
      createdAt: new Date().toISOString(),
    };

    this.userService
      .getUserByEmail(email)
      .pipe(
        switchMap((users: User[]) => {
          if (users.length > 0) {
            this.serverError.set('Email already exists');
            return of(null);
          }

          return this.userService.get_user().pipe(
            switchMap((allUsers: User[]) => {
              const nextId = Math.max(0, ...allUsers.map((u) => u.id ?? 0)) + 1;
              return this.userService.createUser({ ...newUser, id: nextId });
            }),
          );
        }),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (result) => {
          if (!result) return;
          this.router.navigate(['/login']);
        },
        error: () => {
          this.serverError.set('Server error. Try again.');
        },
      });
  }
}
