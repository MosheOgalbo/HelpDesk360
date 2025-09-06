import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { ContactResponse } from '../../../core/models/contact.model';

@Component({
  selector: 'app-requests-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="max-w-6xl mx-auto p-4">
      <mat-card>
        <mat-card-header>
          <mat-card-title>רשימת פניות</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <p class="text-gray-600 mb-4">
            רכיב זה לא נדרש במשימה, אבל אפשר להשתמש בו להצגת רשימת פניות
          </p>
          <button mat-raised-button color="primary" disabled>
            בפיתוח - לא נדרש למשימה
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class RequestsListComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {
    // לא נדרש למשימה - רק טופס פניות ודוח חודשי
  }
}
