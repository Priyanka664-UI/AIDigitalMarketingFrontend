import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Business {
  id?: number;
  businessName: string;
  productDetails: string;
  targetAudience: string;
  brandTone: 'FORMAL' | 'FRIENDLY' | 'PREMIUM' | 'CASUAL' | 'PROFESSIONAL';
  marketingGoal: 'SALES' | 'AWARENESS' | 'LEADS' | 'ENGAGEMENT';
  industry: string;
}

export interface Campaign {
  id?: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  business?: Business;
}

export interface Post {
  id?: number;
  platform: string;
  caption: string;
  hashtags: string;
  imageUrl: string;
  scheduledTime: string;
  status: string;
  likes: number;
  shares: number;
  comments: number;
  reach: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Business APIs
  createBusiness(business: Business): Observable<Business> {
    return this.http.post<Business>(`${this.baseUrl}/business`, business);
  }

  getAllBusinesses(): Observable<Business[]> {
    return this.http.get<Business[]>(`${this.baseUrl}/business`);
  }

  getBusiness(id: number): Observable<Business> {
    return this.http.get<Business>(`${this.baseUrl}/business/${id}`);
  }

  // Campaign APIs
  createCampaign(data: any): Observable<Campaign> {
    return this.http.post<Campaign>(`${this.baseUrl}/campaigns`, data);
  }

  getCampaignsByBusiness(businessId: number): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(`${this.baseUrl}/campaigns/business/${businessId}`);
  }

  generateContent(campaignId: number): Observable<Post[]> {
    return this.http.post<Post[]>(`${this.baseUrl}/campaigns/${campaignId}/generate-content`, {});
  }

  getCampaignPosts(campaignId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseUrl}/campaigns/${campaignId}/posts`);
  }

  getCampaignAnalytics(campaignId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/campaigns/${campaignId}/analytics`);
  }

  // Dashboard APIs
  getDashboardStats(businessId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard/stats?businessId=${businessId}`);
  }

  getPlatformStatus(businessId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard/platform-status?businessId=${businessId}`);
  }

  // Content APIs
  getCalendar(businessId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/content/calendar?businessId=${businessId}`);
  }

  getLibrary(businessId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/content/library?businessId=${businessId}`);
  }

  getDrafts(businessId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/content/drafts?businessId=${businessId}`);
  }

  updateDraft(id: number, post: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/content/drafts/${id}`, post);
  }

  // AI APIs
  generateAIContent(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/ai/generate-content`, data);
  }

  generateImage(prompt: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/ai/image/generate`, { prompt });
  }

  regenerateCaption(postId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/ai/regenerate-caption`, { postId });
  }

  getAIInsights(businessId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/ai/insights?businessId=${businessId}`);
  }

  // Analytics APIs
  getEngagementAnalytics(businessId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/engagement?businessId=${businessId}`);
  }

  getPlatformComparison(businessId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/platform-comparison?businessId=${businessId}`);
  }

  getCampaignPerformance(campaignId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/campaign-performance?campaignId=${campaignId}`);
  }

  getMonthlyReport(businessId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/report/monthly?businessId=${businessId}`);
  }

  exportCSV(businessId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/export/csv?businessId=${businessId}`);
  }

  // Calendar APIs
  getCalendarPosts(businessId: number, year: number, month: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/calendar/posts?businessId=${businessId}&year=${year}&month=${month}`);
  }

  getCalendarSummary(businessId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/calendar/summary?businessId=${businessId}`);
  }

  // User APIs
  getUser(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${userId}`);
  }

  updateUser(userId: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${userId}`, data);
  }

  changePassword(userId: number, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/${userId}/change-password`, { newPassword });
  }

  upgradePlan(plan: string, userId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/${userId}/upgrade-plan`, { plan });
  }

  updateBusiness(businessId: number, business: any): Observable<Business> {
    return this.http.put<Business>(`${this.baseUrl}/business/${businessId}`, business);
  }

  connectPlatform(platform: string, userId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/platforms/connect`, { platform, userId });
  }

  getAIPreferences(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${userId}/ai-preferences`);
  }

  saveAIPreferences(userId: number, preferences: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/${userId}/ai-preferences`, preferences);
  }

  getNotificationSettings(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${userId}/notification-settings`);
  }

  saveNotificationSettings(userId: number, settings: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/${userId}/notification-settings`, settings);
  }

  // Post APIs
  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/calendar/posts/${postId}`);
  }

  getPostsByPlatform(platform: string, businessId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseUrl}/calendar/posts/platform/${platform}?businessId=${businessId}`);
  }

  deleteCampaign(campaignId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/campaigns/${campaignId}`);
  }

  // Settings CRUD APIs
  getSettings(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/settings/${userId}`);
  }

  updateSettings(userId: number, settings: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/settings/${userId}`, settings);
  }

  deleteSettings(userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/settings/${userId}`);
  }
}
