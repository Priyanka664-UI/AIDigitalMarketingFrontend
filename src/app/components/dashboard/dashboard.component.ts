import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Business, Campaign, Post } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

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
  activeTab: string = 'dashboard';
  contentSubTab: string = 'calendar';
  calendarView: string = 'monthly';
  platformStatus: any[] = [];
  
  imagePrompt: string = '';
  generatedImage: string = '';
  isGeneratingImage: boolean = false;
  aiInsights: any = null;
  
  aiContentConfig = {
    days: 7,
    tone: 'Professional',
    platform: 'INSTAGRAM'
  };
  
  dashboardStats = {
    totalPostsThisMonth: 0,
    draftPosts: 0,
    followersGroup: '0',
    totalReach: '0',
    scheduledPosts: 0
  };
  
  newCampaign = {
    name: '',
    startDate: '',
    endDate: ''
  };

  constructor(private apiService: ApiService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const businessId = localStorage.getItem('businessId');
    if (businessId) {
      this.loadBusiness(+businessId);
      this.loadCampaigns(+businessId);
      this.loadDashboardStats(+businessId);
      this.loadPlatformStatus(+businessId);
      this.loadAIInsights();
    }
  }

  loadDashboardStats(businessId: number) {
    this.apiService.getDashboardStats(businessId).subscribe({
      next: (data) => this.dashboardStats = data,
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  loadPlatformStatus(businessId: number) {
    this.apiService.getPlatformStatus(businessId).subscribe({
      next: (data) => this.platformStatus = data,
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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  generateNewContent() {
    const businessId = localStorage.getItem('businessId');
    if (businessId) {
      this.apiService.generateAIContent({
        campaignId: this.selectedCampaign?.id || 1,
        days: 7,
        tone: 'Professional',
        platform: 'INSTAGRAM'
      }).subscribe({
        next: (data) => alert('Content generated successfully! ✨'),
        error: (err) => console.error('Error:', err)
      });
    }
  }

  regenerateCaption() {
    if (this.posts.length > 0) {
      this.apiService.regenerateCaption(this.posts[0].id!).subscribe({
        next: (data) => {
          alert('Caption regenerated! 🔄');
          this.posts[0] = data;
        },
        error: (err) => console.error('Error:', err)
      });
    }
  }

  generateAIContent() {
    const businessId = localStorage.getItem('businessId');
    if (!businessId) {
      alert('Please select a business first');
      return;
    }

    if (!this.selectedCampaign) {
      alert('Please select a campaign first');
      return;
    }

    this.apiService.generateAIContent({
      campaignId: this.selectedCampaign.id,
      ...this.aiContentConfig
    }).subscribe({
      next: (response: any) => {
        alert(`${response.count || this.aiContentConfig.days} days of content generated! ✨`);
        if (response.posts) {
          this.posts = response.posts;
        }
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Error generating content: ' + (err.error?.error || 'Please try again'));
      }
    });
  }

  generateAIImage() {
    if (!this.imagePrompt.trim()) {
      alert('Please enter an image prompt');
      return;
    }

    this.isGeneratingImage = true;
    this.generatedImage = '';
    console.log('Calling API with prompt:', this.imagePrompt);

    this.apiService.generateImage(this.imagePrompt).subscribe({
      next: (response: any) => {
        console.log('Full response:', response);
        
        if (response && response.imageUrl) {
          this.generatedImage = response.imageUrl;
          console.log('Image URL set to:', this.generatedImage);
          alert('Image generated! 🎨');
        } else {
          console.error('No imageUrl in response');
          alert('Error: No image URL received');
        }
        this.isGeneratingImage = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        alert('Error: ' + (err.message || 'Failed to generate image'));
        this.isGeneratingImage = false;
      }
    });
  }

  downloadImage() {
    if (!this.generatedImage) {
      alert('No image to download');
      return;
    }
    
    console.log('Downloading:', this.generatedImage);
    window.open(this.generatedImage, '_blank');
  }

  saveToLibrary() {
    alert('Image saved to library! 📚');
  }

  loadAIInsights() {
    const businessId = localStorage.getItem('businessId');
    if (businessId) {
      this.apiService.getAIInsights(+businessId).subscribe({
        next: (data) => this.aiInsights = data,
        error: (err) => console.error('Error:', err)
      });
    }
  }

  onImageError(event: any) {
    console.error('Image failed to load:', this.generatedImage);
    event.target.src = 'https://via.placeholder.com/1024x1024?text=Image+Load+Error';
  }

  copyImageUrl() {
    if (this.generatedImage) {
      navigator.clipboard.writeText(this.generatedImage).then(() => {
        alert('Image URL copied to clipboard! 🔗');
      }).catch(err => {
        console.error('Copy failed:', err);
        alert('Failed to copy URL');
      });
    }
  }

  testBackend() {
    console.log('Testing backend connection...');
    this.apiService.generateImage('test').subscribe({
      next: (response) => {
        console.log('Backend test response:', response);
        alert('✅ Backend connected! Response: ' + JSON.stringify(response));
      },
      error: (err) => {
        console.error('Backend test error:', err);
        alert('❌ Backend error: ' + err.message);
      }
    });
  }

  onImageLoad() {
    console.log('Image loaded successfully');
  }
}
