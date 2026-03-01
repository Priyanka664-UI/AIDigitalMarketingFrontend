import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContentManagementService } from '../../services/content-management.service';
import { ApiService } from '../../services/api.service';
import { AiImageService } from '../../services/ai-image.service';

@Component({
  selector: 'app-content-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content-management.component.html',
  styleUrls: ['./content-management.component.css']
})
export class ContentManagementComponent implements OnInit {
  activeTab = 'ai-generator';
  
  // Image Generation
  imagePrompt = '';
  generatedImage = '';
  isGenerating = false;
  
  contentRequest = {
    productName: '',
    targetAudience: '',
    tone: 'PROFESSIONAL',
    goal: 'SALES',
    platform: 'INSTAGRAM'
  };
  generatedContent: any = null;
  
  creativeRequest = {
    designType: 'POSTER',
    productName: '',
    tagline: '',
    colorScheme: '',
    style: 'MODERN'
  };
  generatedCreative: any = null;
  
  campaigns: any[] = [];
  scheduleRequest = {
    campaignId: null as number | null,
    platform: 'INSTAGRAM',
    caption: '',
    hashtags: '',
    imageUrl: '',
    scheduledTime: ''
  };
  scheduledPosts: any[] = [];
  
  loading = false;

  constructor(
    private contentService: ContentManagementService,
    private apiService: ApiService,
    private aiImageService: AiImageService
  ) {}

  ngOnInit() {
    this.loadCampaigns();
  }

  generateImage() {
    if (!this.imagePrompt.trim()) return;

    this.isGenerating = true;
    this.aiImageService.generateImage(this.imagePrompt).subscribe({
      next: (res) => {
        this.generatedImage = res.imageUrl;
        this.isGenerating = false;
      },
      error: (err) => {
        console.error('Image generation failed:', err);
        alert('Image generation failed. Please try again.');
        this.isGenerating = false;
      }
    });
  }

  useGeneratedImage() {
    this.scheduleRequest.imageUrl = this.generatedImage;
    alert('Image added to post! Go to scheduler to complete your post.');
  }

  loadCampaigns() {
    const businessId = localStorage.getItem('businessId');
    if (businessId) {
      this.apiService.getCampaignsByBusiness(+businessId).subscribe({
        next: (data) => this.campaigns = data,
        error: (err) => console.error(err)
      });
    }
  }

  generateContent() {
    this.loading = true;
    this.contentService.generateContent(this.contentRequest).subscribe({
      next: (data) => {
        this.generatedContent = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  generateCreative() {
    this.loading = true;
    this.contentService.generateCreative(this.creativeRequest).subscribe({
      next: (data) => {
        this.generatedCreative = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  schedulePost() {
    if (!this.scheduleRequest.campaignId || this.scheduleRequest.campaignId === 0) {
      alert('Please select a campaign first!');
      return;
    }
    if (!this.scheduleRequest.caption) {
      alert('Please enter a caption!');
      return;
    }
    if (!this.scheduleRequest.scheduledTime) {
      alert('Please select a date and time!');
      return;
    }
    
    this.loading = true;
    this.contentService.schedulePost(this.scheduleRequest).subscribe({
      next: (data) => {
        alert('Post scheduled successfully!');
        this.loadScheduledPosts();
        this.resetScheduleForm();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        alert('Error scheduling post: ' + (err.error?.message || 'Please check all fields'));
        this.loading = false;
      }
    });
  }

  loadScheduledPosts() {
    if (this.scheduleRequest.campaignId) {
      this.contentService.getScheduledPosts(this.scheduleRequest.campaignId).subscribe({
        next: (data) => this.scheduledPosts = data,
        error: (err) => console.error(err)
      });
    }
  }

  deletePost(postId: number) {
    if (confirm('Delete this post?')) {
      this.contentService.deletePost(postId).subscribe({
        next: () => this.loadScheduledPosts(),
        error: (err) => console.error(err)
      });
    }
  }

  useCaption(caption: string) {
    this.scheduleRequest.caption = caption;
    this.activeTab = 'scheduler';
  }

  useHashtags(hashtags: string[]) {
    this.scheduleRequest.hashtags = hashtags.join(' ');
    this.activeTab = 'scheduler';
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
}
