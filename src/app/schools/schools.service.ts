import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {finalize, Observable} from 'rxjs';
import { tap } from 'rxjs/operators';
import {environment} from "../../environments/environment";
import {School} from "../shared/models/school";
import {Invoice} from "../shared/models/invoice";
import {Collection} from "../shared/models/collection";

@Injectable({
  providedIn: 'root'
})
export class SchoolsService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getSchools(): Observable<School[]> {
    return this.http.get<School[]>(`${this.baseUrl}/schools`);
  }

  getSchool(schoolId: number): Observable<School> {
    return this.http.get<School>(`${this.baseUrl}/schools/${schoolId}`);
  }

  getInvoices(schoolId: number): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.baseUrl}/invoices?schoolId=${schoolId}`);
  }

  createInvoice(school: School, invoice: Partial<Invoice>): Observable<Invoice> {
    const newInvoice: Partial<Invoice> = {
      invoiceNumber: `INV-${Date.now()}`, // generate a unique invoice number
      schoolId: school.id,
      schoolName: school.name,
      creationDate: new Date().toISOString(),
      balance: invoice.amount,
      paidAmount: 0,
      status: 'Pending',
      daysUntilDue: Math.floor((new Date(invoice.dueDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      ...invoice
    };
    return this.http.post<Invoice>(`${this.baseUrl}/invoices`, newInvoice);
  }

  updateInvoice(invoice: Partial<Invoice>): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.baseUrl}/invoices/${invoice.id}`, invoice);
  }

  removeInvoice(invoiceId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/invoices/${invoiceId}`).pipe(
      tap(() => {
        // delete collections associated with the invoice
        this.http.get<Collection[]>(`${this.baseUrl}/collections?invoiceId=${invoiceId}`).subscribe(collections => {
          collections.forEach(collection => {
            this.http.delete<void>(`${this.baseUrl}/collections/${collection.id}`).subscribe();
          });
        });
      })
    );
  }

  getCollections(schoolId: number): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${this.baseUrl}/collections?schoolId=${schoolId}`);
  }

  updateCollection(collection: Partial<Collection>): Observable<Collection> {
    return this.http.patch<Collection>(`${this.baseUrl}/collections/${collection.id}`, collection);
  }
}
