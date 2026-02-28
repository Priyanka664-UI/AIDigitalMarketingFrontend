import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Business, Campaign, Post } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  business: Business | null = null;
  campaigns: Campaign[] = [];
  selectedCampaign: Campaign | null = null;
  posts: Post[] = [];
  analytics: any = null;
  showCreateCampaign = false;
  
  newCampaign = {
    name: '',
    startDate: '',
    endDate: ''
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    const businessId = localStorage.getItem('businessId');
    if (businessId) {
      this.loadBusiness(+businessId);
      this.loadCampaigns(+businessId);
    }
  }

  loadBusiness(id: number) {
    this.apiService.getBusiness(id).subscribe({
      next: (data) => this.business = data,
      error: (err) => console.error('Error loading business:', err)
    });
  }

  loadCampaigns(businessId: number) {
    this.apiService.getCampaignsByBusiness(businessId).subscribe({
      next: (data) => this.campaigns = data,
      error: (err) => console.error('Error loading campaigns:', err)
    });
  }

  createCampaign() {
    const businessId = localStorage.getItem('businessId');
    if (businessId) {
      this.apiService.createCampaign({
        businessId: +businessId,
        ...this.newCampaign
      }).subscribe({
        next: (campaign) => {
          this.campaigns.push(campaign);
          this.showCreateCampaign = false;
          this.newCampaign = { name: '', startDate: '', endDate: '' };
        },
        error: (err) => console.error('Error creating campaign:', err)
      });
    }
  }

  selectCampaign(campaign: Campaign) {
    this.selectedCampaign = campaign;
    this.loadCampaignPosts(campaign.id!);
    this.loadAnalytics(campaign.id!);
  }

  loadCampaignPosts(campaignId: number) {
    this.apiService.getCampaignPosts(campaignId).subscribe({
      next: (data) => this.posts = data,
      error: (err) => console.error('Error loading posts:', err)
    });
  }

  loadAnalytics(campaignId: number) {
    this.apiService.getCampaignAnalytics(campaignId).subscribe({
      next: (data) => this.analytics = data,
      error: (err) => console.error('Error loading analytics:', err)
    });
  }

  generateContent() {
    if (this.selectedCampaign) {
      this.apiService.generateContent(this.selectedCampaign.id!).subscribe({
        next: (posts) => {
          this.posts = posts;
          alert('Content generated successfully! 🎉');
        },
        error: (err) => console.error('Error generating content:', err)
      });
    }
  }

  getPlatformIcon(platform: string): string {
    const icons: any = {
      'INSTAGRAM': '📷',
      'FACEBOOK': '👥',
      'LINKEDIN': '💼',
      'WHATSAPP': '💬'
    };
    return icons[platform] || '📱';
  }
}
