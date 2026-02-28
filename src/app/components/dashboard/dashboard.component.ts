import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService, Business, Campaign, Post } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ContentManagementService } from '../../services/content-management.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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

  ngOnInit() {
    const businessId = localStorage.getItem('businessId');
    if (businessId) {
      this.loadBusiness(+businessId);
      this.loadCampaigns(+businessId);
    }
  }

  loadBusiness(id: number) {
    this.apiService.getBusiness(id).subscribe({ next: (data) => this.business = data, error: (err) => console.error(err) });
  }

  loadCampaigns(businessId: number) {
    this.apiService.getCampaignsByBusiness(businessId).subscribe({ next: (data) => this.campaigns = data, error: (err) => console.error(err) });
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
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

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
    });
  }

  generateAIImage() {
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
      }
    });
  }

  downloadImage() { if (this.generatedImage) window.open(this.generatedImage, '_blank'); else alert('No image'); }
  saveToLibrary() { alert('Image saved! 📚'); }
  onImageError(event: any) { 
    console.error('Image failed to load');
    event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"%3E%3Crect fill="%23f0f0f0" width="1024" height="1024"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="48" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage Load Error%3C/text%3E%3C/svg%3E';
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
