import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService, Business, Campaign, Post } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CalendarComponent } from '../calendar/calendar.component';
import { SettingsComponent } from '../settings/settings.component';
import { ContentManagementService } from '../../services/content-management.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CalendarComponent, SettingsComponent],
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
  showSettingsMenu: boolean = false;
  settingsTab: string = 'account';
  private hideMenuTimeout: any;
  
  selectedPlatform: string = 'all';
  platformPosts: { [key: string]: Post[] } = {};
  showAllPostsModal: boolean = false;

  toasts: Array<{message: string, type: string}> = [];

  loading = false;
  contentRequest = { productName: '', targetAudience: '', tone: 'PROFESSIONAL', goal: 'SALES', platform: 'INSTAGRAM' };
  generatedContent: any = null;
  creativeRequest = { designType: 'POSTER', productName: '', tagline: '', colorScheme: '', style: 'MODERN' };
  generatedCreative: any = null;
  scheduleRequest = { campaignId: null as number | null, platform: 'INSTAGRAM', caption: '', hashtags: '', imageUrl: '', scheduledTime: '' };
  scheduledPosts: any[] = [];

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

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private contentService: ContentManagementService,
    private toastService: ToastService
  ) { }

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
      this.loadScheduledPosts();
      
      // Auto-refresh posts every 30 seconds to show status updates
      setInterval(() => {
        this.loadAllRecentPosts(bId);
        this.loadDashboardStats(bId);
      }, 30000);
    }

    // Subscribe to toast notifications
    this.toastService.toast$.subscribe(toast => {
      this.toasts.push(toast);
      setTimeout(() => {
        this.toasts.shift();
      }, 3000);
    });
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
    this.apiService.getCampaignsByBusiness(businessId).subscribe({
      next: (campaigns) => {
        if (campaigns && campaigns.length > 0) {
          const allPosts: Post[] = [];
          let loaded = 0;
          campaigns.forEach(campaign => {
            this.apiService.getCampaignPosts(campaign.id!).subscribe({
              next: (posts) => {
                allPosts.push(...posts);
                loaded++;
                if (loaded === campaigns.length) {
                  this.posts = allPosts.sort((a, b) => 
                    new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
                  );
                }
              },
              error: (err) => console.error('Error loading posts:', err)
            });
          });
        }
      }
    });
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
    this.apiService.getBusiness(id).subscribe({ next: (data) => this.business = data, error: (err) => console.error(err) });
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

  selectCampaign(campaign: Campaign) {
    this.selectedCampaign = campaign;
    this.loadCampaignPosts(campaign.id!);
    this.loadAnalytics(campaign.id!);
  }

  loadCampaignPosts(campaignId: number) {
    this.apiService.getCampaignPosts(campaignId).subscribe({ next: (data) => this.posts = data, error: (err) => console.error(err) });
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

  onSettingsLeave() {
    this.hideMenuTimeout = setTimeout(() => {
      this.showSettingsMenu = false;
    }, 300);
  }

  cancelHideMenu() {
    if (this.hideMenuTimeout) {
      clearTimeout(this.hideMenuTimeout);
    }
  }

  navigateToSettings(tab: string) {
    this.activeTab = 'settings';
    this.settingsTab = tab;
    this.showSettingsMenu = false;
    if (this.hideMenuTimeout) {
      clearTimeout(this.hideMenuTimeout);
    }
  }

  generateAIContent() {
    const businessId = localStorage.getItem('businessId');
    if (!businessId || !this.selectedCampaign) {
      this.toastService.error('Please ensure you have a business and campaign selected.');
      return;
    }

    this.apiService.generateAIContent({
      campaignId: this.selectedCampaign.id,
      ...this.aiContentConfig
    }).subscribe({
      next: (response: any) => {
        this.toastService.success(`${response.count || this.aiContentConfig.days} days of content generated successfully! ✨`);
        if (response.posts) this.posts = response.posts;
        this.loadAllRecentPosts(+businessId);
        this.activeTab = 'dashboard';
      },
      error: (err) => this.toastService.error('Error: ' + (err.error?.error || 'Please try again'))
    });
  }

  generateAIImage() {
    if (!this.imagePrompt.trim()) {
      this.toastService.warning('Please enter an image prompt');
      return;
    }

    this.isGeneratingImage = true;
    this.generatedImage = '';
    this.generatedContent = null;

    this.apiService.generateImage(this.imagePrompt).subscribe({
      next: (response: any) => {
        if (response && response.imageUrl) {
          this.generatedImage = response.imageUrl;
          this.scheduleRequest.imageUrl = response.imageUrl;
          
          this.contentRequest.productName = this.imagePrompt;
          this.contentService.generateContent(this.contentRequest).subscribe({
            next: (data: any) => {
              this.generatedContent = data;
              this.toastService.success('🎨 Image and content generated successfully!');
              this.isGeneratingImage = false;
            },
            error: (err: any) => {
              console.error('Content generation failed:', err);
              this.toastService.warning('Image generated but content generation failed.');
              this.isGeneratingImage = false;
            }
          });
        }
      },
      error: (err: any) => {
        console.error('Image generation failed:', err);
        this.isGeneratingImage = false;
        this.toastService.error('Failed to generate image. Please try again.');
      }
    });
  }

  downloadImage() {
    if (this.generatedImage) {
      window.open(this.generatedImage, '_blank');
    } else {
      this.toastService.warning('No image to download');
    }
  }

  saveToLibrary() {
    this.toastService.success('Image saved to library! 📚');
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
    console.error('Image failed to load');
    event.target.src = 'https://via.placeholder.com/1024x1024?text=Image+Load+Error';
  }

  onImageLoad() {
    console.log('Image loaded');
  }

  copyImageUrl() {
    if (this.generatedImage) {
      navigator.clipboard.writeText(this.generatedImage).then(() => {
        this.toastService.success('Image URL copied to clipboard! 🔗');
      }).catch(() => this.toastService.error('Failed to copy URL'));
    }
  }

  getFirstName(): string {
    const name = this.business?.businessName || 'User';
    return name.split(' ')[0];
  }

  generateAIContentForm() {
    this.loading = true;
    this.contentService.generateContent(this.contentRequest).subscribe({
      next: (data: any) => {
        this.generatedContent = data;
        this.loading = false;
        this.toastService.success('Content generated! ✨');
      },
      error: (err: any) => {
        console.error(err);
        this.toastService.error('Error: ' + (err.error?.message || 'Failed'));
        this.loading = false;
      }
    });
  }

  generateCreativeForm() {
    this.loading = true;
    this.contentService.generateCreative(this.creativeRequest).subscribe({
      next: (data: any) => {
        this.generatedCreative = data;
        this.loading = false;
        this.toastService.success('Creative generated! 🎨');
      },
      error: (err: any) => {
        console.error(err);
        this.toastService.error('Error: ' + (err.error?.message || 'Failed'));
        this.loading = false;
      }
    });
  }

  schedulePost() {
    if (!this.scheduleRequest.campaignId) { this.toastService.warning('Select campaign!'); return; }
    if (!this.scheduleRequest.caption) { this.toastService.warning('Enter caption!'); return; }
    if (!this.scheduleRequest.scheduledTime) { this.toastService.warning('Select date/time!'); return; }
    this.loading = true;
    this.contentService.schedulePost(this.scheduleRequest).subscribe({
      next: (data: any) => {
        this.toastService.success('Post scheduled! 📅');
        this.loadScheduledPosts();
        this.resetScheduleForm();
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.toastService.error('Error: ' + (err.error?.message || 'Failed'));
        this.loading = false;
      }
    });
  }

  loadScheduledPosts() {
    if (this.scheduleRequest.campaignId) {
      this.contentService.getScheduledPosts(this.scheduleRequest.campaignId).subscribe({
        next: (data: any) => this.scheduledPosts = data,
        error: (err: any) => console.error(err)
      });
    }
  }

  deleteScheduledPost(postId: number) {
    if (confirm('Are you sure you want to delete this scheduled post?')) {
      this.contentService.deletePost(postId).subscribe({
        next: () => this.loadScheduledPosts(),
        error: (err: any) => console.error(err)
      });
    }
  }

  resetScheduleForm() {
    const currentCampaignId = this.scheduleRequest.campaignId;
    this.scheduleRequest = {
      campaignId: currentCampaignId,
      platform: 'INSTAGRAM',
      caption: '',
      hashtags: '',
      imageUrl: '',
      scheduledTime: ''
    };
  }

  useHashtag(hashtag: string) {
    const currentHashtags = this.scheduleRequest.hashtags.trim();
    if (currentHashtags) {
      this.scheduleRequest.hashtags = currentHashtags + ' ' + hashtag;
    } else {
      this.scheduleRequest.hashtags = hashtag;
    }
    this.scrollToScheduler();
  }

  useCaption(caption: string) {
    this.scheduleRequest.caption = caption;
    this.scrollToScheduler();
  }

  useHashtags(hashtags: string[]) {
    this.scheduleRequest.hashtags = hashtags.join(' ');
    this.scrollToScheduler();
  }

  scrollToScheduler() {
    setTimeout(() => {
      const schedulerElement = document.getElementById('post-scheduler');
      if (schedulerElement) {
        schedulerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  createCampaign() {
    const businessId = localStorage.getItem('businessId');
    if (!businessId) {
      this.toastService.error('Business ID not found. Please log in again.');
      return;
    }

    const request = {
      businessId: +businessId,
      name: this.newCampaign.name,
      startDate: this.newCampaign.startDate,
      endDate: this.newCampaign.endDate
    };

    this.apiService.createCampaign(request).subscribe({
      next: (campaign) => {
        this.campaigns.push(campaign);
        this.showCreateCampaign = false;
        this.newCampaign = { name: '', startDate: '', endDate: '' };
        this.toastService.success('Campaign created successfully! 🚀');
        this.loadCampaigns(+businessId);
      },
      error: (err) => {
        console.error('Error creating campaign:', err);
        this.toastService.error('Failed to create campaign. Please try again.');
      }
    });
  }

  deletePost(postId: number) {
    if (confirm('Delete this post?')) {
      this.apiService.deletePost(postId).subscribe({
        next: () => {
          this.posts = this.posts.filter(p => p.id !== postId);
          const businessId = localStorage.getItem('businessId');
          if (businessId) this.loadAllRecentPosts(+businessId);
        },
        error: (err) => console.error(err)
      });
    }
  }

  loadPlatformPosts(platform: string) {
    const businessId = localStorage.getItem('businessId');
    if (businessId) {
      this.apiService.getPostsByPlatform(platform, +businessId).subscribe({
        next: (posts) => this.platformPosts[platform] = posts,
        error: (err) => console.error(err)
      });
    }
  }

  viewAllPosts(platform: string) {
    this.selectedPlatform = platform;
    this.loadPlatformPosts(platform);
    this.showAllPostsModal = true;
  }

  getPostsByPlatform(platform: string): Post[] {
    return this.posts.filter(p => p.platform === platform);
  }
}
