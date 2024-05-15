import {Component, Inject, inject, PLATFORM_ID, ViewChild} from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import {map, startWith} from 'rxjs/operators';
import {AsyncPipe, DatePipe, isPlatformBrowser, KeyValuePipe, NgForOf, NgIf} from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {DashboardService} from "./dashboard.service";
import {Target} from "../shared/models/target";
import {ChartData, ChartOptions, ChartType} from "chart.js";
import {BaseChartDirective} from "ng2-charts";
import {Collection} from "../shared/models/collection";
import {Observable, Subject, switchMap} from "rxjs";
import {Signup} from "../shared/models/signup";
import {Revenue} from "../shared/models/revenue";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";
import {Invoice} from "../shared/models/invoice";
import {CollectPaymentDialogComponent} from "../shared/collect-payment-dialog/collect-payment-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {AppService} from "../app.service";
import {MatSidenav} from "@angular/material/sidenav";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
  imports: [
    AsyncPipe,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    NgForOf,
    BaseChartDirective,
    KeyValuePipe,
    NgIf,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    DatePipe
  ]
})
export class DashboardComponent {
  private breakpointObserver = inject(BreakpointObserver);
  displayedColumns: string[] = ['invoiceNumber', 'schoolName', 'amount', 'dueDate', 'collectPayment'];
  isBrowser: boolean = false;

  cardLayout = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return {
          columns: 1,
          miniCard: { cols: 1, rows: 3 },
          pieChart: { cols: 1, rows: 6 },
          barChart: { cols: 1, rows: 6 },
          table: { cols: 1, rows: 8 },
        };
      }

      return {
        columns: 12,
        miniCard: { cols: 3, rows: 3 },
        pieChart: { cols: 4, rows: 6 },
        barChart: { cols: 12, rows: 6 },
        table: { cols: 12, rows: 8 },
      };
    })
  );

  collections: Collection[] = [];
  signups: Signup = {};
  revenue: Revenue = {};
  @ViewChild(MatSidenav) sidenav: MatSidenav | undefined;
  public targetsVisualization = this.dashboardService.getTargets().pipe(
    map((targets: Target[]) => {
      return targets.map(target => {
        return {
          title: target.product,
          pieChartLabels: [ [ 'Target' ], [ 'Achieved' ] ],
          pieChartDataSets: [ {
            data: [ target.target, target.achieved ]
          } ],
        }
      });
    })
  );
  public signupsVisualization = this.dashboardService.getSignups().pipe(
    map((signups: Signup): {
      title: string,
      barChartLabels: string[],
      barChartData: ChartData
    } => {
      // Get all the products
      const products = Object.keys(signups);

      // remove the total key
      products.splice(products.indexOf('total'), 1);

      // Get all the school types
      const schoolTypes = Object.keys(signups[products[0]]);

      return {
        title: 'Signups',
        barChartLabels: products,
        barChartData: {
          datasets: schoolTypes.map(schoolType => {
            return {
              label: schoolType,
              data: products.map(product => signups[product][schoolType]),
              stack: 'a'
            };
          })
        }
      }
    })
  );
  private reloadUpcomingInvoices$ = new Subject<void>();
  public upcomingInvoices$: Observable<Invoice[]> = this.reloadUpcomingInvoices$.pipe(
    startWith(null),
    switchMap(() => this.dashboardService.getInvoices().pipe(
      map(invoices => {
        return invoices.filter(invoice => new Date(invoice.dueDate) > new Date()).sort(
          (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
        )
      })
    )));

  constructor(private dashboardService: DashboardService,
              protected appService: AppService,
              private dialog: MatDialog,
              @Inject(PLATFORM_ID) private platformId: Object) {
    this.dashboardService.getCollections().subscribe(collections => {
      this.collections = collections;
    });
    this.dashboardService.getSignups().subscribe(signups => {
      this.signups = signups;
    });
    this.dashboardService.getRevenue().subscribe(revenue => {
      this.revenue = revenue;
    });

    appService.toggleSidenav.subscribe(() => {
      this.sidenav?.toggle();
    });
  }

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getBouncedCheques(): number {
    return this.collections.filter(collection => collection?.status === 'Bounced').length;
  }

  openCollectPaymentDialog(invoice: Invoice): void {
    const dialogRef = this.dialog.open(CollectPaymentDialogComponent, {
      width: '250px',
      data: invoice
    });

    dialogRef.afterClosed().subscribe(collection => {
      this.collections.push(collection);
      this.reloadUpcomingInvoices$.next();
    });
  }
}
