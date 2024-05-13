import {Component} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Observable, Subject, switchMap, tap} from "rxjs";
import {School} from "../shared/models/school";
import {SchoolsService} from "./schools.service";
import {map, startWith} from "rxjs/operators";
import {AsyncPipe, DatePipe, NgIf} from "@angular/common";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {AppService} from "../app.service";
import {Invoice} from "../shared/models/invoice";
import {Collection} from "../shared/models/collection";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {CollectPaymentDialogComponent} from "../shared/collect-payment-dialog/collect-payment-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {FormsModule} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {
  CreateOrUpdateInvoiceDialogComponent
} from "../shared/create-or-update-invoice-dialog/create-or-update-invoice-dialog.component";

@Component({
  selector: 'app-schools',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    DatePipe,
    MatIconButton,
    MatIcon,
    MatButton,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    MatHeaderCellDef,
    FormsModule
  ],
  templateUrl: './schools.component.html',
  styleUrl: './schools.component.scss'
})
export class SchoolsComponent {
  invoiceColumns: string[] = ['invoiceNumber', 'invoiceItem', 'creationDate', 'dueDate', 'amount', 'paidAmount', 'balance', 'completionStatus', 'daysUntilDue', 'actions'];
  selectedStatus: string = 'All';
  collectionColumns: string[] = ['invoiceNumber', 'collectionNumber', 'dateOfCollection', 'status', 'amount'];

  school$: Observable<School> = this.route.params.pipe(
    map(params => params['id']),
    switchMap(id => this.schoolService.getSchool(id))
  );

  private reloadInvoices$ = new Subject<void>();
  invoices$: Observable<Invoice[]> = this.route.params.pipe(
    map(params => params['id']),
    switchMap(id => this.reloadInvoices$.pipe(
      startWith(null), // to load invoices initially
      switchMap(() => this.schoolService.getInvoices(id))
    ))
  );
  filteredInvoices$: Observable<Invoice[]> = this.invoices$.pipe(
    switchMap(invoices =>
      this.route.params.pipe(
        map(params => params['id']),
        switchMap(id => this.schoolService.getInvoices(id)),
        map(invoices => invoices.filter(invoice => invoice.status === this.selectedStatus || this.selectedStatus === 'All'))
      )
    )
  );

  private reloadCollections$ = new Subject<void>();
  collections$: Observable<Collection[]> = this.route.params.pipe(
    map(params => params['id']),
    switchMap(id => this.reloadCollections$.pipe(
      startWith(null), // to load collections initially
      switchMap(() => this.schoolService.getCollections(id))
    ))
  );

  constructor(
    private schoolService: SchoolsService,
    protected appService: AppService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {

  }

  filterInvoices() {
    console.log(this.selectedStatus);
    this.filteredInvoices$ = this.invoices$.pipe(
      map(invoices => invoices.filter(invoice => invoice.status === this.selectedStatus || this.selectedStatus === 'All'))
    );
  }

  openCreateInvoiceDialog(school: School): void {
    const dialogRef = this.dialog.open(CreateOrUpdateInvoiceDialogComponent, {
      width: '400px',
      data: {
        invoice: null,
        school: school
      }
    });

    dialogRef.afterClosed().subscribe(invoice => {
      this.reloadInvoices$.next();
    });
  }

  openUpdateInvoiceDialog(invoice: Invoice): void {
    const dialogRef = this.dialog.open(CreateOrUpdateInvoiceDialogComponent, {
      width: '400px',
      data: {
        invoice: invoice,
        school: null
      }
    });

    dialogRef.afterClosed().subscribe(invoice => {
      this.reloadInvoices$.next();
    });
  }

  openCollectPaymentDialog(invoice: Invoice): void {
    const dialogRef = this.dialog.open(CollectPaymentDialogComponent, {
      width: '350px',
      data: invoice
    });

    dialogRef.afterClosed().subscribe(collection => {
      this.reloadCollections$.next();
      this.reloadInvoices$.next();
    });
  }

  updateCollectionStatus(collection: Collection, status: string): void {
    this.schoolService.updateCollection({
      id: collection.id,
      status: status
    }).subscribe({
      next: () => {
        this.reloadCollections$.next();
        this.reloadInvoices$.next();
        this.snackBar.open('Collection status updated', 'Dismiss', {
          duration: 5000
        });
      },
      error: (error) => {
        this.snackBar.open(error.error.message, 'Dismiss', {
          duration: 5000
        });
      }
    });
  }

  deleteInvoice(invoice: Invoice): void {
    this.schoolService.removeInvoice(invoice.id).subscribe({
      next: () => {
        this.reloadCollections$.next();
        this.reloadInvoices$.next();
        this.snackBar.open('Invoice removed', 'Dismiss', {
          duration: 5000
        });
      },
      error: (error) => {
        this.snackBar.open(error.error.message, 'Dismiss', {
          duration: 5000
        });
      }
    });
  }
}
