import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.css'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LandingComponent {
    // Navigation helper for "Get Started" and "Login"
}
