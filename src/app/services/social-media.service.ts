import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SocialConnection {
  id: number;
  businessId: number;
  platform: 'INSTAGRAM' | 'FACEBOOK' | 'LINKEDIN' | 'WHATSAPP';
  isConnected: boolean;
  connectedAt: string;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocialMediaService {
  private apiUrl = `${environment.apiUrl}/social`;

  constructor(private http: HttpClient) {}

  connectPlatform(businessId: number, platform: string): Observable<SocialConnection> {
    return this.http.post<SocialConnection>(`${this.apiUrl}/connect`, { businessId, platform });
  }

  disconnectPlatform(businessId: number, platform: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/disconnect`, { businessId, platform });
  }

  getConnections(businessId: number): Observable<SocialConnection[]> {
    return this.http.get<SocialConnection[]>(`${this.apiUrl}/connections/${businessId}`);
  }
}
