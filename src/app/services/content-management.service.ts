import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContentGenerationRequest {
  productName: string;
  targetAudience: string;
  tone: string;
  goal: string;
  platform: string;
}

export interface ContentGenerationResponse {
  captions: string[];
  hashtags: string[];
  postIdeas: string[];
  contentCalendar: ContentCalendarItem[];
}

export interface ContentCalendarItem {
  day: string;
  postType: string;
  caption: string;
  hashtags: string;
}

export interface CreativeGenerationRequest {
  designType: string;
  productName: string;
  tagline: string;
  colorScheme: string;
  style: string;
}

export interface PostScheduleRequest {
  campaignId: number | null;
  platform: string;
  caption: string;
  hashtags: string;
  imageUrl: string;
  scheduledTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContentManagementService {
  private baseUrl = 'http://192.168.0.107:8084/api/content';

  constructor(private http: HttpClient) {}

  generateContent(request: ContentGenerationRequest): Observable<ContentGenerationResponse> {
    return this.http.post<ContentGenerationResponse>(`${this.baseUrl}/generate`, request);
  }

  generateCreative(request: CreativeGenerationRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/creative/generate`, request);
  }

  schedulePost(request: PostScheduleRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/schedule`, request);
  }

  getScheduledPosts(campaignId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/scheduled/${campaignId}`);
  }

  updatePost(postId: number, request: PostScheduleRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/post/${postId}`, request);
  }

  deletePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/post/${postId}`);
  }
}
