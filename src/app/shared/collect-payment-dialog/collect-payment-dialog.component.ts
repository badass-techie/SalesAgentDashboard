import { Component, Inject } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {DashboardService} from "../../dashboard/dashboard.service";
import {Invoice} from "../models/invoice";
import {MatSnackBar} from "@angular/material/snack-bar";
import {NgStyle} from "@angular/common";

@Component({
  selector: 'app-collect-payment-dialog',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    NgStyle
  ],
  template: `
    <h1 mat-dialog-title>Collect Payment</h1>
    <div mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field style="width: 100%">
          <mat-label>Amount</mat-label>
          <input matInput formControlName="amount">
        </mat-form-field>
        <mat-form-field style="width: 100%">
          <mat-label>Status</mat-label>
          <select matNativeControl formControlName="status">
            <option value="Valid">Valid</option>
            <option value="Bounced">Bounced</option>
          </select>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions style="padding: 0 16px 16px 16px">
      <button mat-button (click)="onNoClick()">Cancel</button>
      <button mat-button (click)="onSubmit()"
              [ngStyle]="{'background-color': form.invalid ? '#999999' : '#00bb42', 'color': 'white'}"
              [mat-dialog-close]="form.value"
              [disabled]="form.invalid">Collect
      </button>
    </div>
  `,
})
export class CollectPaymentDialogComponent {
  form = this.fb.group({
    amount: [null, [Validators.required, Validators.pattern('^[0-9]*$')]],
    status: ['Valid', [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CollectPaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Invoice,
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dashboardService.collectPayment(this.data, this.form.value.amount!, this.form.value.status!).subscribe({
        next: (collection) => {
          this.dialogRef.close(collection);
        },
        error: (err) => {
          this.snackBar.open(`Error: ${err.message}`, 'Close', {
            duration: 5000,
          });
        },
        complete: () => {
          this.snackBar.open('Payment collected successfully', 'Close', {
            duration: 5000,
          });
        }
      });
    }
  }
}
