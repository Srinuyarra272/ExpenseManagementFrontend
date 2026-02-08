import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, NgIf, NgClass
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  error = '';

  // Typewriter Code
  displayText = '';
  phrases = [
    'Track expenses, set budgets, and achieve your financial goals.',
    'Gain insights into your spending habits effortlessly.',
    'Take control of your financial future today.'
  ];
  currentPhraseIndex = 0;
  isDeleting = false;
  typingSpeed = 50;
  deletingSpeed = 30;
  pauseTime = 2000;
  private timeoutId: any;

  ngOnInit() {
    this.typeWriter();
  }

  ngOnDestroy() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }

  typeWriter() {
    const currentPhrase = this.phrases[this.currentPhraseIndex];
    if (this.isDeleting) {
      this.displayText = currentPhrase.substring(0, this.displayText.length - 1);
    } else {
      this.displayText = currentPhrase.substring(0, this.displayText.length + 1);
    }

    let typeSpeed = this.isDeleting ? this.deletingSpeed : this.typingSpeed;

    if (!this.isDeleting && this.displayText === currentPhrase) {
      typeSpeed = this.pauseTime;
      this.isDeleting = true;
    } else if (this.isDeleting && this.displayText === '') {
      this.isDeleting = false;
      this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.phrases.length;
      typeSpeed = 500;
    }

    this.timeoutId = setTimeout(() => this.typeWriter(), typeSpeed);
  }

  onSubmit() {
    if (this.form.valid) {
      this.error = '';
      this.authService.login(this.form.value as any).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Login failed';
        }
      });
    }
  }
}
