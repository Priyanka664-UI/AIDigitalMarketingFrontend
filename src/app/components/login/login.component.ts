import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthValidatorService } from '../../services/auth-validator.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  formData = {
    email: '',
    password: ''
  };

  errorMessage = '';
  loading = false;
  showPassword = false;

  constructor(
    private authValidator: AuthValidatorService,
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    const validation = this.authValidator.validateLogin(this.formData);
    
    if (validation.status === 'invalid') {
      this.errorMessage = validation.message;
      return;
    }

    this.errorMessage = '';
    this.loading = true;

    this.authService.login(this.formData).subscribe({
      next: (response) => {
        this.authService.saveAuthData(response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed';
        this.loading = false;
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
