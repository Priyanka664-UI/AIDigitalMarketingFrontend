import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CalendarComponent implements OnInit {
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  calendarDays: any[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  postsData: any = {};
  summary: any = null;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadCalendarData();
    this.loadSummary();
  }

  get currentMonthName(): string {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
  }

  loadCalendarData() {
    const businessId = localStorage.getItem('businessId');
    if (!businessId) return;

    this.apiService.getCalendarPosts(+businessId, this.currentYear, this.currentMonth + 1).subscribe({
      next: (data: any) => {
        this.postsData = data.posts || {};
        this.generateCalendarDays();
      },
      error: (err) => console.error('Error loading calendar:', err)
    });
  }

  loadSummary() {
    const businessId = localStorage.getItem('businessId');
    if (!businessId) return;

    this.apiService.getCalendarSummary(+businessId).subscribe({
      next: (data) => this.summary = data,
      error: (err) => console.error('Error loading summary:', err)
    });
  }

  generateCalendarDays() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const prevLastDay = new Date(this.currentYear, this.currentMonth, 0);

    const firstDayIndex = firstDay.getDay();
    const lastDayDate = lastDay.getDate();
    const prevLastDayDate = prevLastDay.getDate();

    const days: any[] = [];
    const today = new Date();

    for (let i = firstDayIndex; i > 0; i--) {
      const date = prevLastDayDate - i + 1;
      const dateKey = new Date(this.currentYear, this.currentMonth - 1, date).toISOString().split('T')[0];
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        posts: this.postsData[dateKey] || []
      });
    }

    for (let i = 1; i <= lastDayDate; i++) {
      const dateKey = new Date(this.currentYear, this.currentMonth, i).toISOString().split('T')[0];
      const isToday = today.getDate() === i &&
        today.getMonth() === this.currentMonth &&
        today.getFullYear() === this.currentYear;
      days.push({
        date: i,
        isCurrentMonth: true,
        isToday,
        posts: this.postsData[dateKey] || []
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const dateKey = new Date(this.currentYear, this.currentMonth + 1, i).toISOString().split('T')[0];
      days.push({
        date: i,
        isCurrentMonth: false,
        isToday: false,
        posts: this.postsData[dateKey] || []
      });
    }

    this.calendarDays = days;
  }

  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.loadCalendarData();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.loadCalendarData();
  }

  getPlatformIcon(platform: string): string {
    const icons: any = {
      'INSTAGRAM': 'lucide:instagram',
      'FACEBOOK': 'lucide:facebook',
      'LINKEDIN': 'lucide:linkedin',
      'WHATSAPP': 'lucide:message-square'
    };
    return icons[platform] || 'lucide:share-2';
  }

  formatTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
}
