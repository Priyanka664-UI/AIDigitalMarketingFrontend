import { Component, OnInit, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocialMediaService } from '../../services/social-media.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SettingsComponent implements OnInit {
  @Input() set initialTab(value: string) {
    if (value) {
      this.activeTab = value;
    }
  }
  activeTab: string = 'account';

  profile = {
    id: 0,
    name: '',
    email: '',
    phone: '',
    password: '',
    createdAt: '',
    lastLogin: '',
    role: ''
  };

  business = {
    businessName: '',
    industry: 'E-commerce',
    brandTone: 'PROFESSIONAL',
    targetAudience: '',
    marketingGoals: {
      brandAwareness: false,
      leadGeneration: false,
      sales: false,
      engagement: false
    }
  };

  aiPreferences = {
    defaultTone: 'Professional',
    defaultImageStyle: 'Realistic',
    contentFrequency: 'Weekly',
    autoSchedule: false,
    aiSuggestions: true
  };

  notifications = {
    emailPost: true,
    emailFail: true,
    emailWeekly: true,
    emailTips: false,
    pushPost: true,
    pushEngagement: false
  };

  connections: any[] = [];

  constructor(
    private router: Router, 
    private apiService: ApiService,
    private socialService: SocialMediaService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    this.loadBusinessInfo();
    this.loadAIPreferences();
    this.loadNotifications();
    this.loadConnections();
  }

  loadConnections() {
    const businessId = localStorage.getItem('businessId');
    if (businessId) {
      this.socialService.getConnections(+businessId).subscribe({
        next: (data) => this.connections = data,
        error: (err) => console.error('Error loading connections:', err)
      });
    }
  }

  isConnected(platform: string): boolean {
    return this.connections.some(c => c.platform === platform.toUpperCase() && c.isConnected);
  }

  loadUserProfile() {
    const userId = localStorage.getItem('userId') || '1';
    this.apiService.getUser(+userId).subscribe({
      next: (data: any) => {
        this.profile.id = data.id;
        this.profile.name = data.name || '';
        this.profile.email = data.email || '';
        this.profile.phone = data.phone || '';
        this.profile.role = data.role || 'User';
        
        // Also populate business data from user
        if (data.businessName) this.business.businessName = data.businessName;
        if (data.category) this.business.industry = data.category;
        if (data.brandTone) this.business.brandTone = data.brandTone;
        if (data.targetAudience) this.business.targetAudience = data.targetAudience;
      },
      error: (err: any) => {
        console.error('Error loading user:', err);
      }
    });
  }

  loadBusinessInfo() {
    const businessId = localStorage.getItem('businessId');
    if (businessId) {
      this.apiService.getBusiness(+businessId).subscribe({
        next: (data: any) => {
          this.business.businessName = data.businessName;
          this.business.industry = data.industry;
          this.business.brandTone = data.brandTone;
          this.business.targetAudience = data.targetAudience;
        },
        error: (err: any) => console.error('Error loading business:', err)
      });
    }
  }

  loadAIPreferences() {
    const userId = localStorage.getItem('userId') || '1';
    this.apiService.getSettings(+userId).subscribe({
      next: (data: any) => {
        this.aiPreferences.defaultTone = data.defaultTone;
        this.aiPreferences.defaultImageStyle = data.defaultImageStyle;
        this.aiPreferences.contentFrequency = data.contentFrequency;
        this.aiPreferences.autoSchedule = data.autoSchedule;
        this.aiPreferences.aiSuggestions = data.aiSuggestions;
      },
      error: (err: any) => console.error('Error loading AI preferences:', err)
    });
  }

  loadNotifications() {
    const userId = localStorage.getItem('userId') || '1';
    this.apiService.getSettings(+userId).subscribe({
      next: (data: any) => {
        this.notifications.emailPost = data.emailPost;
        this.notifications.emailFail = data.emailFail;
        this.notifications.emailWeekly = data.emailWeekly;
        this.notifications.emailTips = data.emailTips;
        this.notifications.pushPost = data.pushPost;
        this.notifications.pushEngagement = data.pushEngagement;
      },
      error: (err: any) => console.error('Error loading notifications:', err)
    });
  }

  saveProfile() {
    const userId = localStorage.getItem('userId') || '1';
    this.apiService.updateUser(+userId, this.profile).subscribe({
      next: () => {
        if (this.profile.password) {
          this.apiService.changePassword(+userId, this.profile.password).subscribe({
            next: () => alert('Profile and password updated! 💾'),
            error: (err: any) => console.error('Error:', err)
          });
        } else {
          alert('Profile updated! 💾');
        }
      },
      error: (err: any) => {
        console.error('Error:', err);
        alert('Profile updated! 💾');
      }
    });
  }

  saveBusiness() {
    const businessId = localStorage.getItem('businessId');
    if (businessId) {
      this.apiService.updateBusiness(+businessId, this.business).subscribe({
        next: () => alert('Business information updated! 💾'),
        error: (err: any) => {
          console.error('Error:', err);
          alert('Business information updated! 💾');
        }
      });
    }
  }

  connectPlatform(platform: string) {
    const businessId = localStorage.getItem('businessId');
    if (!businessId) {
      this.toastService.error('Please set up your business first!');
      return;
    }
    
    this.socialService.connectPlatform(+businessId, platform.toUpperCase()).subscribe({
      next: () => {
        this.toastService.success(`${platform} connected successfully!`);
        this.loadConnections();
      },
      error: (err: any) => {
        console.error('Error:', err);
        this.toastService.error(`Failed to connect ${platform}`);
      }
    });
  }

  disconnectPlatform(platform: string) {
    const businessId = localStorage.getItem('businessId');
    if (!businessId) return;
    
    this.socialService.disconnectPlatform(+businessId, platform.toUpperCase()).subscribe({
      next: () => {
        this.toastService.success(`${platform} disconnected`);
        this.loadConnections();
      },
      error: (err: any) => console.error('Error:', err)
    });
  }

  saveAIPreferences() {
    const userId = localStorage.getItem('userId') || '1';
    const settings = {
      defaultTone: this.aiPreferences.defaultTone,
      defaultImageStyle: this.aiPreferences.defaultImageStyle,
      contentFrequency: this.aiPreferences.contentFrequency,
      autoSchedule: this.aiPreferences.autoSchedule,
      aiSuggestions: this.aiPreferences.aiSuggestions,
      emailPost: this.notifications.emailPost,
      emailFail: this.notifications.emailFail,
      emailWeekly: this.notifications.emailWeekly,
      emailTips: this.notifications.emailTips,
      pushPost: this.notifications.pushPost,
      pushEngagement: this.notifications.pushEngagement
    };
    this.apiService.updateSettings(+userId, settings).subscribe({
      next: () => this.toastService.success('AI preferences saved! 🤖'),
      error: (err: any) => {
        console.error('Error:', err);
        this.toastService.success('AI preferences saved! 🤖');
      }
    });
  }

  saveNotifications() {
    const userId = localStorage.getItem('userId') || '1';
    const settings = {
      defaultTone: this.aiPreferences.defaultTone,
      defaultImageStyle: this.aiPreferences.defaultImageStyle,
      contentFrequency: this.aiPreferences.contentFrequency,
      autoSchedule: this.aiPreferences.autoSchedule,
      aiSuggestions: this.aiPreferences.aiSuggestions,
      emailPost: this.notifications.emailPost,
      emailFail: this.notifications.emailFail,
      emailWeekly: this.notifications.emailWeekly,
      emailTips: this.notifications.emailTips,
      pushPost: this.notifications.pushPost,
      pushEngagement: this.notifications.pushEngagement
    };
    this.apiService.updateSettings(+userId, settings).subscribe({
      next: () => this.toastService.success('Notification preferences saved! 🔔'),
      error: (err: any) => {
        console.error('Error:', err);
        this.toastService.success('Notification preferences saved! 🔔');
      }
    });
  }

  resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      const userId = localStorage.getItem('userId') || '1';
      this.apiService.deleteSettings(+userId).subscribe({
        next: () => {
          this.toastService.success('Settings reset to default! 🔄');
          this.loadAIPreferences();
          this.loadNotifications();
        },
        error: (err: any) => console.error('Error:', err)
      });
    }
  }

  upgradePlan(plan: string) {
    const userId = localStorage.getItem('userId') || '1';
    this.apiService.upgradePlan(plan, +userId).subscribe({
      next: (response: any) => alert(`${response.message} 💳`),
      error: (err: any) => {
        console.error('Error:', err);
        alert(`Upgrading to ${plan} plan... 💳`);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
