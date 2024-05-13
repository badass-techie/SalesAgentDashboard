import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable, tap} from 'rxjs';
import {environment} from "../../environments/environment";
import {Collection} from "../shared/models/collection";
import {Signup} from "../shared/models/signup";
import {Revenue} from "../shared/models/revenue";
import {Invoice} from "../shared/models/invoice";
import {Target} from "../shared/models/target";

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getCollections(): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${this.baseUrl}/collections`);
  }

  getSignups(): Observable<Signup> {
    return this.http.get<Signup>(`${this.baseUrl}/signups`);
  }

  getRevenue(): Observable<Revenue> {
    return this.http.get<Revenue>(`${this.baseUrl}/revenue`);
  }

  getTargets(): Observable<Target[]> {
    return this.http.get<Target[]>(`${this.baseUrl}/targets`);
  }

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.baseUrl}/invoices`);
  }

  collectPayment(invoice: Invoice, amount: number, status: string = 'Valid') {
    const collection: Partial<Collection> = {
      schoolId: invoice.schoolId,
      invoiceId: invoice.id!,
      invoiceNumber: invoice.invoiceNumber,
      collectionNumber: `COL-${Date.now()}`, // generate a unique collection number
      dateOfCollection: new Date().toISOString(),
      status: status,
      amount: amount
    };

    const updatedInvoice: Partial<Invoice> = {
      paidAmount: Number(invoice.paidAmount) + Number(amount),
      balance: Number(invoice.balance) - Number(amount),
      status: collection.status === 'Bounced' ? 'Incomplete' : (invoice.balance - amount > 0 ? 'Pending' : 'Completed')
    };

    // create collection
    return this.http.post(`${this.baseUrl}/collections`, collection).pipe(
      tap({
        next: () => {
          // update invoice
          this.http.patch(`${this.baseUrl}/invoices/${invoice.id}`, updatedInvoice).subscribe();

          // remove amount from school balance
          const updatedSchool = { balance: invoice.balance - amount }; // define your updated school object here
          this.http.patch(`${this.baseUrl}/schools/${invoice.schoolId}`, updatedSchool).subscribe();
        }
      })
    );
  }
}
