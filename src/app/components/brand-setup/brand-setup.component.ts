import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Business } from '../../services/api.service';

@Component({
  selector: 'app-brand-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brand-setup.component.html',
  styleUrls: ['./brand-setup.component.css']
})
export class BrandSetupComponent {
  business: Business = {
    businessName: '',
    productDetails: '',
    targetAudience: '',
    brandTone: 'FRIENDLY',
    marketingGoal: 'AWARENESS',
    industry: ''
  };

  constructor(private apiService: ApiService, private router: Router) {}

  onSubmit() {
    this.apiService.createBusiness(this.business).subscribe({
      next: (result) => {
        localStorage.setItem('businessId', result.id!.toString());
        this.router.navigate(['/dashboard']);
      },
      error: (err) => console.error('Error creating business:', err)
    });
  }
}
