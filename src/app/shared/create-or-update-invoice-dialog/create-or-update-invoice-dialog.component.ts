import { Component, Inject, Optional } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions
} from '@angular/material/dialog';
import { SchoolsService } from '../../schools/schools.service';
import { Invoice } from '../models/invoice';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {Observable} from "rxjs";
import {MatOption, MatSelect} from "@angular/material/select";
import {NgStyle} from "@angular/common";
import {School} from "../models/school";

@Component({
  selector: 'app-create-or-update-invoice-dialog',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatButton,
    MatDialogActions,
    MatLabel,
    MatSelect,
    MatOption,
    NgStyle
  ],
  template: `
    <h1 mat-dialog-title>{{data.invoice ? 'Update Invoice' : 'Create Invoice'}}</h1>
    <div mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field style="width: 100%">
          <mat-label>Invoice Item</mat-label>
          <mat-select formControlName="invoiceItem">
            <mat-option value="Zeraki Analytics">Zeraki Analytics</mat-option>
            <mat-option value="Zeraki Finance">Zeraki Finance</mat-option>
            <mat-option value="Zeraki Timetable">Zeraki Timetable</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field style="width: 100%">
          <mat-label>Due Date</mat-label>
          <input matInput type="date" formControlName="dueDate">
        </mat-form-field>
        <mat-form-field style="width: 100%">
          <mat-label>Amount</mat-label>
          <input matInput formControlName="amount">
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions style="padding: 0 16px 16px 16px">
      <button mat-button (click)="onNoClick()">Cancel</button>
      <button mat-button
              (click)="onSubmit()"
              [ngStyle]="{'background-color': form.invalid ? '#999999' : '#00bb42', 'color': 'white'}"
              [disabled]="form.invalid">{{data.invoice ? 'Update' : 'Create'}}</button>
    </div>
  `,
})
export class CreateOrUpdateInvoiceDialogComponent {
  form = this.fb.group({
    invoiceItem: [this.data.invoice?.invoiceItem || '', Validators.required],
    dueDate: [this.data.invoice?.dueDate || '', Validators.required],
    amount: [this.data.invoice?.amount || '', [Validators.required, Validators.pattern('^[0-9]*$')]],
  });

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateOrUpdateInvoiceDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { invoice: Invoice, school: School },
    private schoolsService: SchoolsService,
    private snackBar: MatSnackBar
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      const invoiceData: Partial<Invoice> = {
        invoiceItem: this.form.value.invoiceItem as string,
        dueDate: this.form.value.dueDate as string,
        amount: this.form.value.amount as number,
      };

      let invoiceObservable: Observable<Invoice>;
      if (this.data.invoice) {
        invoiceData.id = this.data.invoice.id;
        invoiceObservable = this.schoolsService.updateInvoice(invoiceData);
      } else {
        invoiceObservable = this.schoolsService.createInvoice(this.data.school, invoiceData);
      }

      invoiceObservable.subscribe({
        next: (invoice) => {
          this.dialogRef.close(invoice);
        },
        error: (err) => {
          this.snackBar.open(`Error: ${err.message}`, 'Close', {
            duration: 5000,
          });
        },
        complete: () => {
          this.snackBar.open('Invoice operation completed successfully', 'Close', {
            duration: 5000,
          });
        }
      });
    }
  }
}
