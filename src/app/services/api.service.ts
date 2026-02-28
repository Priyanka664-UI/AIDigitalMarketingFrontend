import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private baseUrl = 'http://localhost:9090/api';

  constructor(private http: HttpClient) {}

  createBusiness(business: Business): Observable<Business> {
    return this.http.post<Business>(`${this.baseUrl}/business`, business);
  }

  getAllBusinesses(): Observable<Business[]> {
    return this.http.get<Business[]>(`${this.baseUrl}/business`);
  }

  getBusiness(id: number): Observable<Business> {
    return this.http.get<Business>(`${this.baseUrl}/business/${id}`);
  }

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
}
