import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, UserProfileDto } from '../../core/services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  profileForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  user: UserProfileDto | null = null;
  activeTab: 'profile' | 'security' = 'profile';

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadProfile();
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  loadProfile() {
    this.loading = true;
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue(user);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.showSnack('Failed to load profile');
      }
    });
  }

  updateProfile() {
    if (this.profileForm.invalid) return;

    this.loading = true;
    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.loading = false;
        this.showSnack('Profile updated successfully');
        this.profileForm.markAsPristine();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.showSnack('Failed to update profile');
      }
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;

    this.loading = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.userService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.loading = false;
        this.passwordForm.reset();
        this.showSnack('Password changed successfully');
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.showSnack(err.error?.message || 'Failed to change password');
      }
    });
  }

  showSnack(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }
}
