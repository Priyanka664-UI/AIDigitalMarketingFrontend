import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Business, Campaign, Post } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CalendarComponent } from '../calendar/calendar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardComponent implements OnInit {
  business: any = null;
  campaigns: Campaign[] = [];
  selectedCampaign: Campaign | null = null;
  posts: Post[] = [];
  analytics: any = null;
  showCreateCampaign = false;
  activeTab: string = 'dashboard';
  contentSubTab: string = 'calendar';
  calendarView: string = 'monthly';
  platformStatus: any[] = [];

  imagePrompt: string = '';
  generatedImage: string = '';
  isGeneratingImage: boolean = false;
  aiInsights: any = null;
  engagementAnalytics: any = null;
  platformComparison: any = null;
  monthlyReport: any = null;

  aiContentConfig = {
    days: 7,
    tone: 'Professional',
    platform: 'INSTAGRAM'
  };

  dashboardStats = {
    totalPosts: 0,
    totalReach: '0',
    avgEngagementRate: 0,
    scheduledPosts: 0,
    aiCredits: 0,
    creditsResetDays: 0,
    postsTrend: '',
    engagementTrend: ''
  };

  newCampaign = {
    name: '',
    startDate: '',
    endDate: ''
  };

  constructor(private apiService: ApiService, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    const businessId = localStorage.getItem('businessId');
    if (businessId) {
      const bId = +businessId;
      this.loadBusiness(bId);
      this.loadCampaigns(bId);
      this.loadDashboardStats(bId);
      this.loadPlatformStatus(bId);
      this.loadAIInsights();
      this.loadAllRecentPosts(bId);
      this.loadAnalytics(bId);
    }
  }

  loadAnalytics(businessId: number) {
    this.apiService.getEngagementAnalytics(businessId).subscribe({
      next: (data) => this.engagementAnalytics = data,
      error: (err) => console.error('Error loading engagement analytics:', err)
    });

    this.apiService.getPlatformComparison(businessId).subscribe({
      next: (data) => this.platformComparison = data,
      error: (err) => console.error('Error loading platform comparison:', err)
    });

    this.apiService.getMonthlyReport(businessId).subscribe({
      next: (data) => this.monthlyReport = data,
      error: (err) => console.error('Error loading monthly report:', err)
    });
  }

  loadAllRecentPosts(businessId: number) {
    // For now, we'll just fetch posts from the first campaign if available
    this.apiService.getCampaignsByBusiness(businessId).subscribe({
      next: (campaigns) => {
        if (campaigns && campaigns.length > 0) {
          this.apiService.getCampaignPosts(campaigns[0].id!).subscribe({
            next: (posts) => this.posts = posts,
            error: (err) => console.error('Error loading posts:', err)
          });
        }
      }
    });
  }

  loadDashboardStats(businessId: number) {
    this.apiService.getDashboardStats(businessId).subscribe({
      next: (data) => {
        this.dashboardStats = data;
      },
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  loadPlatformStatus(businessId: number) {
    this.apiService.getPlatformStatus(businessId).subscribe({
      next: (data) => {
        this.platformStatus = data;
      },
      error: (err) => console.error('Error loading platform status:', err)
    });
  }

  loadBusiness(id: number) {
    this.apiService.getBusiness(id).subscribe({
      next: (data) => this.business = data,
      error: (err) => console.error('Error loading business:', err)
    });
  }

  loadCampaigns(businessId: number) {
    this.apiService.getCampaignsByBusiness(businessId).subscribe({
      next: (data) => {
        this.campaigns = data;
        if (this.campaigns.length > 0 && !this.selectedCampaign) {
          this.selectedCampaign = this.campaigns[0];
        }
      },
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

  getPlatformIcon(platform: string): string {
    const p = platform.toUpperCase();
    if (p.includes('INSTAGRAM')) return 'lucide:instagram';
    if (p.includes('FACEBOOK')) return 'lucide:facebook';
    if (p.includes('LINKEDIN')) return 'lucide:linkedin';
    if (p.includes('WHATSAPP')) return 'lucide:message-square';
    if (p.includes('TWITTER') || p.includes('X')) return 'lucide:twitter';
    return 'lucide:share-2';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  generateAIContent() {
    const businessId = localStorage.getItem('businessId');
    if (!businessId || !this.selectedCampaign) {
      alert('Please ensure you have a business and campaign selected.');
      return;
    }

    this.apiService.generateAIContent({
      campaignId: this.selectedCampaign.id,
      ...this.aiContentConfig
    }).subscribe({
      next: (response: any) => {
        alert('Content generated successfully! ✨');
        this.loadAllRecentPosts(+businessId);
        this.activeTab = 'dashboard';
      },
      error: (err) => alert('Error generating content')
    });
  }

  generateAIImage() {
    if (!this.imagePrompt.trim()) return;

    this.isGeneratingImage = true;
    this.apiService.generateImage(this.imagePrompt).subscribe({
      next: (response: any) => {
        if (response && response.imageUrl) {
          this.generatedImage = response.imageUrl;
        }
        this.isGeneratingImage = false;
      },
      error: (err) => {
        this.isGeneratingImage = false;
        alert('Failed to generate image');
      }
    });
  }

  downloadImage() {
    if (this.generatedImage) window.open(this.generatedImage, '_blank');
  }

  saveToLibrary() {
    alert('Image saved to library! 📚');
  }

  loadAIInsights() {
    const businessId = localStorage.getItem('businessId');
    if (businessId) {
      this.apiService.getAIInsights(+businessId).subscribe({
        next: (data) => this.aiInsights = data,
        error: (err) => console.error('Error loading AI insights:', err)
      });
    }
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/1024x1024?text=Image+Load+Error';
  }

  copyImageUrl() {
    if (this.generatedImage) {
      navigator.clipboard.writeText(this.generatedImage).then(() => {
        alert('Image URL copied to clipboard! 🔗');
      });
    }
  }

  getFirstName(): string {
    const name = this.business?.businessName || 'User';
    return name.split(' ')[0];
  }
}

