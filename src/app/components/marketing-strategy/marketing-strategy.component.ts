import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketingStrategyService, MarketingStrategyRequest } from '../../services/marketing-strategy.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-marketing-strategy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marketing-strategy.component.html',
  styleUrls: ['./marketing-strategy.component.css']
})
export class MarketingStrategyComponent {
  showForm: boolean = false;
  showViewModal: boolean = false;
  savedStrategies: any[] = [];
  viewingStrategy: any = null;
  
  request: MarketingStrategyRequest = {
    businessCategory: '',
    businessName: '',
    targetAudience: '',
    primaryGoal: 'Increase sales',
    budgetLevel: 'Medium',
    platforms: []
  };

  strategy: string = '';
  strategyData: any = null;
  loading: boolean = false;
  error: string = '';

  availablePlatforms = ['Instagram', 'Facebook', 'Google Ads', 'Email', 'LinkedIn', 'TikTok', 'Twitter'];
  goals = ['Increase sales', 'Brand awareness', 'Lead generation', 'Social media growth', 'Website traffic'];
  budgetLevels = ['Low', 'Medium', 'High'];

  constructor(private strategyService: MarketingStrategyService) {
    this.loadSavedStrategies();
  }

  loadSavedStrategies() {
    const saved = localStorage.getItem('marketingStrategies');
    if (saved) {
      this.savedStrategies = JSON.parse(saved);
    }
  }

  openForm() {
    this.showForm = true;
    this.strategy = '';
    this.strategyData = null;
  }

  closeForm() {
    this.showForm = false;
  }

  viewStrategy(saved: any) {
    console.log('View clicked, saved data:', saved);
    this.viewingStrategy = saved.data;
    this.showViewModal = true;
    console.log('Modal should show:', this.showViewModal);
  }

  closeViewModal() {
    this.showViewModal = false;
    this.viewingStrategy = null;
  }

  togglePlatform(platform: string) {
    const index = this.request.platforms.indexOf(platform);
    if (index > -1) {
      this.request.platforms.splice(index, 1);
    } else {
      this.request.platforms.push(platform);
    }
  }

  isPlatformSelected(platform: string): boolean {
    return this.request.platforms.includes(platform);
  }

  generateStrategy() {
    if (!this.request.businessName || !this.request.businessCategory || this.request.platforms.length === 0) {
      this.error = 'Please fill in all required fields and select at least one platform';
      return;
    }

    this.loading = true;
    this.error = '';
    this.strategy = '';
    this.strategyData = null;

    console.log('Sending request:', this.request);

    this.strategyService.generateStrategy(this.request).subscribe({
      next: (response) => {
        console.log('Raw response:', response);
        console.log('Response type:', typeof response);
        
        try {
          // Handle different response formats
          if (typeof response === 'string') {
            console.log('Response is string, parsing...');
            this.strategyData = JSON.parse(response);
            this.strategy = response;
          } else if (response && typeof response === 'object') {
            console.log('Response is object');
            this.strategyData = response;
            this.strategy = JSON.stringify(response, null, 2);
          }
          
          console.log('Strategy data:', this.strategyData);
          console.log('Strategy string:', this.strategy);
          
          this.loading = false;
          
          // Save to localStorage
          const strategyRecord = {
            id: Date.now(),
            businessName: this.request.businessName,
            category: this.request.businessCategory,
            goal: this.request.primaryGoal,
            createdAt: new Date().toISOString(),
            data: this.strategyData
          };
          this.savedStrategies.unshift(strategyRecord);
          localStorage.setItem('marketingStrategies', JSON.stringify(this.savedStrategies));
        } catch (e) {
          console.error('Parse error:', e);
          this.strategy = typeof response === 'string' ? response : JSON.stringify(response);
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('HTTP Error:', err);
        this.error = 'Failed to generate strategy: ' + (err.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  copyStrategy() {
    navigator.clipboard.writeText(this.strategy).then(() => {
      alert('Strategy copied to clipboard!');
    });
  }

  downloadStrategy() {
    if (!this.strategyData) {
      // Fallback to text download
      const blob = new Blob([this.strategy], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.request.businessName}-marketing-strategy.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      return;
    }

    // Generate PDF
    const pdf = new jsPDF();
    let yPos = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('30-Day Marketing Strategy', margin, yPos);
    yPos += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Business: ${this.request.businessName}`, margin, yPos);
    yPos += 7;
    pdf.text(`Goal: ${this.request.primaryGoal}`, margin, yPos);
    yPos += 15;

    // Positioning
    if (this.strategyData.positioning) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Brand Positioning', margin, yPos);
      yPos += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPos = this.addWrappedText(pdf, `UVP: ${this.strategyData.positioning.uvp}`, margin, yPos, maxWidth);
      yPos = this.addWrappedText(pdf, `Messaging: ${this.strategyData.positioning.messaging}`, margin, yPos, maxWidth);
      yPos += 10;
    }

    // Weekly Plan
    if (this.strategyData.weeks) {
      for (const week of this.strategyData.weeks) {
        if (yPos > 250) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Week ${week.week}: ${week.title}`, margin, yPos);
        yPos += 8;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        if (week.setup) yPos = this.addWrappedText(pdf, week.setup, margin, yPos, maxWidth);
        if (week.storytelling) yPos = this.addWrappedText(pdf, week.storytelling, margin, yPos, maxWidth);
        if (week.conversionCampaign) yPos = this.addWrappedText(pdf, week.conversionCampaign, margin, yPos, maxWidth);
        yPos += 8;
      }
    }

    // Content Ideas - ALL 20 IDEAS
    if (this.strategyData.contentPlan) {
      pdf.addPage();
      yPos = 20;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Content Ideas (All 20 Posts)', margin, yPos);
      yPos += 10;

      for (const weekPlan of this.strategyData.contentPlan) {
        if (yPos > 260) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Week ${weekPlan.week}`, margin, yPos);
        yPos += 7;

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        for (const idea of weekPlan.ideas) {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.setFont('helvetica', 'bold');
          yPos = this.addWrappedText(pdf, `${idea.title}`, margin, yPos, maxWidth);
          pdf.setFont('helvetica', 'normal');
          yPos = this.addWrappedText(pdf, idea.caption, margin + 2, yPos, maxWidth - 2);
          yPos = this.addWrappedText(pdf, `CTA: ${idea.cta}`, margin + 2, yPos, maxWidth - 2);
          yPos = this.addWrappedText(pdf, `#${idea.hashtags.join(' #')}`, margin + 2, yPos, maxWidth - 2);
          yPos += 3;
        }
        yPos += 3;
      }
    }

    // KPIs
    if (this.strategyData.kpis) {
      pdf.addPage();
      yPos = 20;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KPIs & Metrics', margin, yPos);
      yPos += 10;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      if (this.strategyData.kpis.metrics) {
        for (const metric of this.strategyData.kpis.metrics) {
          yPos = this.addWrappedText(pdf, `${metric.platform}: ${metric.metrics.join(', ')}`, margin, yPos, maxWidth);
        }
      }
      if (this.strategyData.kpis.conversionExpectations) {
        yPos += 5;
        yPos = this.addWrappedText(pdf, this.strategyData.kpis.conversionExpectations, margin, yPos, maxWidth);
      }
    }

    // Tools
    if (this.strategyData.tools) {
      pdf.addPage();
      yPos = 20;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recommended Tools', margin, yPos);
      yPos += 10;
      pdf.setFontSize(9);
      if (this.strategyData.tools.scheduling) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Scheduling:', margin, yPos);
        yPos += 5;
        pdf.setFont('helvetica', 'normal');
        for (const tool of this.strategyData.tools.scheduling) {
          yPos = this.addWrappedText(pdf, `${tool.name}: ${tool.reason}`, margin + 2, yPos, maxWidth - 2);
        }
      }
      if (this.strategyData.tools.analytics) {
        yPos += 5;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Analytics:', margin, yPos);
        yPos += 5;
        pdf.setFont('helvetica', 'normal');
        for (const tool of this.strategyData.tools.analytics) {
          yPos = this.addWrappedText(pdf, `${tool.name}: ${tool.reason}`, margin + 2, yPos, maxWidth - 2);
        }
      }
    }

    pdf.save(`${this.request.businessName}-marketing-strategy.pdf`);
  }

  private addWrappedText(pdf: jsPDF, text: string, x: number, y: number, maxWidth: number): number {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * 5) + 3;
  }
}
