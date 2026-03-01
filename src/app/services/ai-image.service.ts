import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AiImageService {
  private baseUrl = 'http://localhost:8083/api/ai/image';

  constructor(private http: HttpClient) {}

  generateImage(prompt: string): Observable<{ imageUrl: string }> {
    return this.http.post<{ imageUrl: string }>(`${this.baseUrl}/generate`, { prompt });
  }

  regeneratePostImage(postId: number, prompt?: string): Observable<{ imageUrl: string; message: string }> {
    return this.http.post<{ imageUrl: string; message: string }>(
      `${this.baseUrl}/regenerate/${postId}`,
      prompt ? { prompt } : {}
    );
  }
}
