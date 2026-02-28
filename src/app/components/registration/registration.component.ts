import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthValidatorService } from '../../services/auth-validator.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  formData = {
    owner_name: '',
    owner_email: '',
    business_name: '',
    category: '',
    target_audience: '',
    brand_tone: '',
    contact: '',
    password: ''
  };

  errors: string[] = [];
  loading = false;
  showPassword = false;

  constructor(
    private authValidator: AuthValidatorService,
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    const validation = this.authValidator.validateSignup(this.formData);
    
    if (validation.status === 'invalid') {
      this.errors = validation.errors;
      return;
    }

    this.errors = [];
    this.loading = true;

    this.authService.signup({
      businessName: validation.normalized_data.business_name,
      category: validation.normalized_data.category,
      targetAudience: validation.normalized_data.target_audience,
      brandTone: validation.normalized_data.brand_tone,
      contact: validation.normalized_data.contact,
      password: this.formData.password
    }).subscribe({
      next: (response) => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errors = [err.error?.message || 'Registration failed'];
        this.loading = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
