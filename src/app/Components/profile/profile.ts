import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  NonNullableFormBuilder,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Users } from './../../services/users';
import { User } from '../../Core/Interfaces/user.model';
import { finalize } from 'rxjs/operators';

type ProfileForm = {
  fullName: FormControl<string>;
  country: FormControl<string>;
  city: FormControl<string>;
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  profileForm!: FormGroup<ProfileForm>;

  currentUser = signal<User | null>(null);
  isEditMode = signal(false);
  isLoading = signal(false);
  serverError = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  showCountryDropdown = false;
  countries: string[] = ['Egypt', 'Saudi Arabia', 'UAE', 'Kuwait', 'Qatar', 'Canada'];
  selectedCountry: string = '';

  constructor(
    private fb: NonNullableFormBuilder,
    private userService: Users,
    private router: Router,
  ) {
    this.profileForm = this.fb.group({
      fullName: [
        '',
        [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z\s]+$/)],
      ],
      country: ['', Validators.required],
      city: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
    });

    // Disable form initially (view mode)
    this.profileForm.disable();
  }

  ngOnInit() {
    this.loadUserFromLocalStorage();
  }

  loadUserFromLocalStorage() {
    // Check if user has token (is logged in)
    const token = localStorage.getItem('token');

    if (!token) {
      // No token, redirect to login
      this.router.navigate(['/login']);
      return;
    }

    // Get user data from localStorage (you need to save this in login)
    const userStr = localStorage.getItem('currentUser');

    if (userStr) {
      try {
        const user: User = JSON.parse(userStr);
        this.currentUser.set(user);
        this.selectedCountry = user.address.country;

        // Populate form with user data
        this.profileForm.patchValue({
          fullName: user.fullName,
          country: user.address.country,
          city: user.address.city,
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.router.navigate(['/login']);
      }
    } else {
      // No user data, redirect to login
      console.log('No user data found in localStorage');
      this.router.navigate(['/login']);
    }
  }

  toggleEditMode() {
    const newMode = !this.isEditMode();
    this.isEditMode.set(newMode);

    if (newMode) {
      // Enable form for editing
      this.profileForm.enable();
    } else {
      // Cancel edit - disable and reset
      this.profileForm.disable();
      this.loadUserFromLocalStorage(); // Reset to original values
      this.successMessage.set(null);
      this.serverError.set(null);
    }
  }

  toggleCountryDropdown() {
    if (this.isEditMode()) {
      this.showCountryDropdown = !this.showCountryDropdown;
    }
  }

  selectCountry(country: string) {
    this.selectedCountry = country;
    this.showCountryDropdown = false;
    this.profileForm.patchValue({ country });
  }

  onSave() {
    this.profileForm.markAllAsTouched();
    this.serverError.set(null);
    this.successMessage.set(null);

    if (this.profileForm.invalid || !this.currentUser()) return;

    this.isLoading.set(true);

    const formValue = this.profileForm.getRawValue();
    const user = this.currentUser()!;

    const updatedUser: User = {
      ...user,
      fullName: formValue.fullName,
      address: {
        country: formValue.country,
        city: formValue.city,
      },
    };

    // Update user in database
    this.userService
      .updateUser(user.id!, updatedUser)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (result) => {
          // Update localStorage with new data
          localStorage.setItem('currentUser', JSON.stringify(result));
          this.currentUser.set(result);
          this.isEditMode.set(false);
          this.profileForm.disable();
          this.successMessage.set('Profile updated successfully!');

          // Clear success message after 3 seconds
          setTimeout(() => this.successMessage.set(null), 3000);
        },
        error: (err) => {
          console.error('Update error:', err);
          this.serverError.set('Failed to update profile. Try again.');
        },
      });
  }

  logout() {
    // Clear all localStorage data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  // Validation getters
  get fullNameErrors() {
    const control = this.profileForm.controls.fullName;
    if (control.touched && control.invalid) {
      if (control.errors?.['required']) return 'Full name is required';
      if (control.errors?.['minlength']) return 'Name must be at least 3 characters';
      if (control.errors?.['pattern']) return 'Name can only contain letters';
    }
    return null;
  }

  get countryErrors() {
    const control = this.profileForm.controls.country;
    if (control.touched && control.invalid) {
      if (control.errors?.['required']) return 'Please select a country';
    }
    return null;
  }

  get cityErrors() {
    const control = this.profileForm.controls.city;
    if (control.touched && control.invalid) {
      if (control.errors?.['required']) return 'City is required';
      if (control.errors?.['pattern']) return 'City can only contain letters';
    }
    return null;
  }
}
