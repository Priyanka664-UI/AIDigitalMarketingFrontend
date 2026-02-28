import { Injectable } from '@angular/core';

export interface SignupInput {
  business_name: string;
  category: string;
  target_audience: string;
  brand_tone: string;
  contact: string;
  password: string;
}

export interface SignupValidationResult {
  status: 'valid' | 'invalid';
  errors: string[];
  normalized_data: {
    business_name: string;
    category: string;
    target_audience: string;
    brand_tone: string;
    contact: string;
  };
  brand_summary: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginValidationResult {
  status: 'valid' | 'invalid';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthValidatorService {

  validateSignup(input: SignupInput): SignupValidationResult {
    const errors: string[] = [];
    
    if (!input.business_name?.trim()) errors.push('Business name is required');
    if (!input.category?.trim()) errors.push('Category is required');
    if (!input.target_audience?.trim()) errors.push('Target audience is required');
    if (!input.brand_tone?.trim()) errors.push('Brand tone is required');
    if (!input.contact?.trim()) errors.push('Email or mobile is required');
    if (!input.password) errors.push('Password is required');

    if (input.contact?.trim() && !this.isValidContact(input.contact)) {
      errors.push('Invalid email format or mobile number must be 10 digits');
    }

    if (input.password) {
      const passwordErrors = this.validatePassword(input.password);
      errors.push(...passwordErrors);
    }

    const normalizedTone = this.normalizeBrandTone(input.brand_tone);
    if (input.brand_tone?.trim() && !normalizedTone) {
      errors.push('Brand tone must be Formal, Friendly, or Bold');
    }

    const brandSummary = errors.length === 0 
      ? this.generateBrandSummary(input.category, input.target_audience)
      : '';

    return {
      status: errors.length === 0 ? 'valid' : 'invalid',
      errors,
      normalized_data: {
        business_name: input.business_name?.trim() || '',
        category: input.category?.trim() || '',
        target_audience: input.target_audience?.trim() || '',
        brand_tone: normalizedTone || input.brand_tone?.trim() || '',
        contact: input.contact?.trim() || ''
      },
      brand_summary: brandSummary
    };
  }

  validateLogin(input: LoginInput): LoginValidationResult {
    if (!input.email?.trim()) {
      return { status: 'invalid', message: 'Email is required' };
    }

    if (!input.password) {
      return { status: 'invalid', message: 'Password is required' };
    }

    if (!this.isValidContact(input.email)) {
      return { status: 'invalid', message: 'Invalid email format' };
    }

    return { status: 'valid', message: 'Login input format is valid.' };
  }

  private isValidContact(contact: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\d{10}$/;
    return emailRegex.test(contact) || mobileRegex.test(contact);
  }

  private normalizeBrandTone(tone: string): string {
    const normalized = tone?.trim().toLowerCase();
    if (normalized === 'formal') return 'Formal';
    if (normalized === 'friendly') return 'Friendly';
    if (normalized === 'bold') return 'Bold';
    return '';
  }

  private generateBrandSummary(category: string, targetAudience: string): string {
    return `A ${category} business focused on serving ${targetAudience}.\nDesigned to engage and convert the target market effectively.`;
  }

  private validatePassword(password: string): string[] {
    return []; // Disabled for testing
  }
}
