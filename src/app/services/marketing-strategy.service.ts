import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MarketingStrategyRequest {
  businessCategory: string;
  businessName: string;
  targetAudience: string;
  primaryGoal: string;
  budgetLevel: string;
  platforms: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MarketingStrategyService {
  private apiUrl = 'http://localhost:8083/api/marketing-strategy';

  constructor(private http: HttpClient) {}

  generateStrategy(request: MarketingStrategyRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate`, request);
  }
}
