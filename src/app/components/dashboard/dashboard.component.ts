import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService, Business, Campaign, Post } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
<<<<<<< HEAD
import { CalendarComponent } from '../calendar/calendar.component';
=======
import { ContentManagementService } from '../../services/content-management.service';
>>>>>>> ddf7a41105bd73a8b47b15a2744f2d421b3f4882

@Component({
  selector: 'app-dashboard',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, FormsModule, CalendarComponent],
=======
  imports: [CommonModule, FormsModule, RouterModule],
>>>>>>> ddf7a41105bd73a8b47b15a2744f2d421b3f4882
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
<<<<<<< HEAD
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
=======
  platformStatus: any[] = [
    { name: 'Instagram', icon: '📷', connected: true },
    { name: 'Facebook', icon: '👥', connected: true },
    { name: 'LinkedIn', icon: '💼', connected: false },
    { name: 'WhatsApp', icon: '💬', connected: false }
  ];
  
  contentRequest = { productName: '', targetAudience: '', tone: 'PROFESSIONAL', goal: 'SALES', platform: 'INSTAGRAM' };
  generatedContent: any = null;
  creativeRequest = { designType: 'POSTER', productName: '', tagline: '', colorScheme: '', style: 'MODERN' };
  generatedCreative: any = null;
  scheduleRequest = { campaignId: null as number | null, platform: 'INSTAGRAM', caption: '', hashtags: '', imageUrl: '', scheduledTime: '' };
  scheduledPosts: any[] = [];
  loading = false;
  imagePrompt: string = '';
  generatedImage: string = '';
  isGeneratingImage: boolean = false;
  aiInsights: any = { bestContentType: 'Image Posts', bestPostingTime: '10:00 AM - 12:00 PM', suggestedCampaigns: ['Product Launch', 'Brand Awareness'], trendingTopics: ['#AI', '#Marketing', '#SocialMedia'] };
  aiContentConfig = { days: 7, tone: 'Professional', platform: 'INSTAGRAM' };
  dashboardStats = { totalPostsThisMonth: 0, draftPosts: 0, followersGroup: '0', totalReach: '0', scheduledPosts: 0 };
  newCampaign = { name: '', startDate: '', endDate: '' };

  constructor(private apiService: ApiService, private authService: AuthService, private router: Router, private contentService: ContentManagementService) {}
>>>>>>> ddf7a41105bd73a8b47b15a2744f2d421b3f4882

  ngOnInit() {
    const businessId = localStorage.getItem('businessId');
    if (businessId) {
<<<<<<< HEAD
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

=======
      this.loadBusiness(+businessId);
      this.loadCampaigns(+businessId);
    }
  }

>>>>>>> ddf7a41105bd73a8b47b15a2744f2d421b3f4882
  loadBusiness(id: number) {
    this.apiService.getBusiness(id).subscribe({ next: (data) => this.business = data, error: (err) => console.error(err) });
  }

  loadCampaigns(businessId: number) {
<<<<<<< HEAD
    this.apiService.getCampaignsByBusiness(businessId).subscribe({
      next: (data) => {
        this.campaigns = data;
        if (this.campaigns.length > 0 && !this.selectedCampaign) {
          this.selectedCampaign = this.campaigns[0];
        }
      },
      error: (err) => console.error('Error loading campaigns:', err)
    });
=======
    this.apiService.getCampaignsByBusiness(businessId).subscribe({ next: (data) => this.campaigns = data, error: (err) => console.error(err) });
>>>>>>> ddf7a41105bd73a8b47b15a2744f2d421b3f4882
  }

  createCampaign() {
    const businessId = localStorage.getItem('businessId');
    if (businessId) {
      this.apiService.createCampaign({ businessId: +businessId, ...this.newCampaign }).subscribe({
        next: (campaign) => { this.campaigns.push(campaign); this.showCreateCampaign = false; this.newCampaign = { name: '', startDate: '', endDate: '' }; },
        error: (err) => console.error(err)
      });
    }
  }

<<<<<<< HEAD
  getPlatformIcon(platform: string): string {
    const p = platform.toUpperCase();
    if (p.includes('INSTAGRAM')) return 'lucide:instagram';
    if (p.includes('FACEBOOK')) return 'lucide:facebook';
    if (p.includes('LINKEDIN')) return 'lucide:linkedin';
    if (p.includes('WHATSAPP')) return 'lucide:message-square';
    if (p.includes('TWITTER') || p.includes('X')) return 'lucide:twitter';
    return 'lucide:share-2';
=======
  selectCampaign(campaign: Campaign) {
    this.selectedCampaign = campaign;
    this.loadCampaignPosts(campaign.id!);
    this.loadAnalytics(campaign.id!);
  }

  loadCampaignPosts(campaignId: number) {
    this.apiService.getCampaignPosts(campaignId).subscribe({ next: (data) => this.posts = data, error: (err) => console.error(err) });
  }

  loadAnalytics(campaignId: number) {
    this.apiService.getCampaignAnalytics(campaignId).subscribe({ next: (data) => this.analytics = data, error: (err) => console.error(err) });
  }

  generateContent() {
    if (this.selectedCampaign) {
      this.apiService.generateContent(this.selectedCampaign.id!).subscribe({ next: (posts) => { this.posts = posts; alert('Content generated! 🎉'); }, error: (err) => console.error(err) });
    }
  }

  getPlatformIcon(platform: string): string {
    const icons: any = { 'INSTAGRAM': '📷', 'FACEBOOK': '👥', 'LINKEDIN': '💼', 'WHATSAPP': '💬' };
    return icons[platform] || '📱';
>>>>>>> ddf7a41105bd73a8b47b15a2744f2d421b3f4882
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

<<<<<<< HEAD
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
=======
  generateNewContent() {
    const businessId = localStorage.getItem('businessId');
    if (businessId) {
      this.apiService.generateAIContent({ campaignId: this.selectedCampaign?.id || 1, days: 7, tone: 'Professional', platform: 'INSTAGRAM' }).subscribe({
        next: (data) => alert('Content generated! ✨'), error: (err) => console.error(err)
      });
    }
  }

  regenerateCaption() {
    if (this.posts.length > 0) {
      this.apiService.regenerateCaption(this.posts[0].id!).subscribe({ next: (data) => { alert('Caption regenerated! 🔄'); this.posts[0] = data; }, error: (err) => console.error(err) });
    }
  }

  generateAIContent() {
    if (!localStorage.getItem('businessId')) { alert('Please select a business first'); return; }
    if (!this.selectedCampaign) { alert('Please select a campaign first'); return; }
    this.apiService.generateAIContent({ campaignId: this.selectedCampaign.id, ...this.aiContentConfig }).subscribe({
      next: (response: any) => { alert(`${response.count || this.aiContentConfig.days} days of content generated! ✨`); if (response.posts) this.posts = response.posts; },
      error: (err) => alert('Error: ' + (err.error?.error || 'Please try again'))
>>>>>>> ddf7a41105bd73a8b47b15a2744f2d421b3f4882
    });
  }

  generateAIImage() {
<<<<<<< HEAD
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
=======
    if (!this.imagePrompt.trim()) { 
      alert('Please enter an image prompt'); 
      return; 
    }
    
    this.isGeneratingImage = true;
    this.generatedImage = '';
    
    this.apiService.generateImage(this.imagePrompt).subscribe({
      next: (response: any) => {
        this.generatedImage = response.imageUrl;
        this.isGeneratingImage = false;
        alert('🎨 Image generated successfully!');
      },
      error: (err: any) => {
        console.error('Image generation failed:', err);
        this.isGeneratingImage = false;
        alert('Failed to generate image. Please try again.');
>>>>>>> ddf7a41105bd73a8b47b15a2744f2d421b3f4882
      }
    });
  }

<<<<<<< HEAD
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
=======
  downloadImage() { if (this.generatedImage) window.open(this.generatedImage, '_blank'); else alert('No image'); }
  saveToLibrary() { alert('Image saved! 📚'); }
  onImageError(event: any) { 
    console.error('Image failed to load');
    event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"%3E%3Crect fill="%23f0f0f0" width="1024" height="1024"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="48" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage Load Error%3C/text%3E%3C/svg%3E';
>>>>>>> ddf7a41105bd73a8b47b15a2744f2d421b3f4882
  }
  copyImageUrl() { if (this.generatedImage) navigator.clipboard.writeText(this.generatedImage).then(() => alert('Copied! 🔗')).catch(() => alert('Failed')); }
  onImageLoad() { console.log('Image loaded'); }

  generateAIContentForm() {
    this.loading = true;
    this.contentService.generateContent(this.contentRequest).subscribe({
      next: (data: any) => { this.generatedContent = data; this.loading = false; alert('Content generated! ✨'); },
      error: (err: any) => { console.error(err); alert('Error: ' + (err.error?.message || 'Failed')); this.loading = false; }
    });
  }

  generateCreativeForm() {
    this.loading = true;
    this.contentService.generateCreative(this.creativeRequest).subscribe({
      next: (data: any) => { this.generatedCreative = data; this.loading = false; alert('Creative generated! 🎨'); },
      error: (err: any) => { console.error(err); alert('Error: ' + (err.error?.message || 'Failed')); this.loading = false; }
    });
  }

  schedulePost() {
    if (!this.scheduleRequest.campaignId) { alert('Select campaign!'); return; }
    if (!this.scheduleRequest.caption) { alert('Enter caption!'); return; }
    if (!this.scheduleRequest.scheduledTime) { alert('Select date/time!'); return; }
    this.loading = true;
    this.contentService.schedulePost(this.scheduleRequest).subscribe({
      next: (data: any) => { alert('Post scheduled! 📅'); this.loadScheduledPosts(); this.resetScheduleForm(); this.loading = false; },
      error: (err: any) => { console.error(err); alert('Error: ' + (err.error?.message || 'Failed')); this.loading = false; }
    });
  }

  loadScheduledPosts() {
    if (this.scheduleRequest.campaignId) {
      this.contentService.getScheduledPosts(this.scheduleRequest.campaignId).subscribe({ next: (data: any) => this.scheduledPosts = data, error: (err: any) => console.error(err) });
    }
  }

  deleteScheduledPost(postId: number) {
    if (confirm('Delete?')) {
      this.contentService.deletePost(postId).subscribe({ next: () => this.loadScheduledPosts(), error: (err: any) => console.error(err) });
    }
  }

  resetScheduleForm() {
    const currentCampaignId = this.scheduleRequest.campaignId;
    this.scheduleRequest = { campaignId: currentCampaignId, platform: 'INSTAGRAM', caption: '', hashtags: '', imageUrl: '', scheduledTime: '' };
  }

  useCaption(caption: string) { this.scheduleRequest.caption = caption; }
  useHashtags(hashtags: string[]) { this.scheduleRequest.hashtags = hashtags.join(' '); }
}

