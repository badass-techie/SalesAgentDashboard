import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {Collection} from "../shared/models/collection";
import {environment} from "../../environments/environment";
import {Signup} from "../shared/models/signup";
import {Revenue} from "../shared/models/revenue";
import {Target} from "../shared/models/target";
import {Invoice} from "../shared/models/invoice";

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService]
    });

    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure that there are no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch collections', () => {
    const dummyCollections: Collection[] = [
      {
        id: 1,
        schoolId: 1,
        invoiceId: 1,
        invoiceNumber: 'INV-001',
        collectionNumber: 'COL-001',
        dateOfCollection: '2024-05-13T00:00:00.000Z',
        status: 'Valid',
        amount: 1000
      }
    ];

    service.getCollections().subscribe(collections => {
      expect(collections.length).toBe(1);
      expect(collections).toEqual(dummyCollections);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/collections`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyCollections);
  });

  it('should fetch signups', () => {
    const dummySignups: Signup = {
      "Zeraki Analytics": {
        "Primary": 1,
        "Secondary": 0,
        "IGCSE": 0,
        "Total": 1
      }
    };

    service.getSignups().subscribe(signups => {
      expect(signups).toEqual(dummySignups);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/signups`);
    expect(req.request.method).toBe('GET');
    req.flush(dummySignups);
  });

  it('should fetch revenue', () => {
    const dummyRevenue: Revenue = {
      'Product A': 1000,
      'Product B': 2000
    };

    service.getRevenue().subscribe(revenue => {
      expect(revenue).toEqual(dummyRevenue);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/revenue`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyRevenue);
  });

  it('should fetch targets', () => {
    const dummyTargets: Target[] = [
      {
        id: 1,
        product: 'Product A',
        target: 100,
        achieved: 50
      },
      {
        id: 2,
        product: 'Product B',
        target: 10,
        achieved: 5
      }
    ];

    service.getTargets().subscribe(targets => {
      expect(targets.length).toBe(2);
      expect(targets).toEqual(dummyTargets);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/targets`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyTargets);
  });

  it('should fetch invoices', () => {
    const dummyInvoices: Invoice[] = [
      {
        id: 1,
        schoolId: 1,
        schoolName: 'School',
        invoiceNumber: 'INV-001',
        invoiceItem: 'Item 1',
        creationDate: '2024-05-13T00:00:00.000Z',
        dueDate: '2024-06-13T00:00:00.000Z',
        amount: 1000,
        paidAmount: 500,
        balance: 500,
        status: 'Pending',
        daysUntilDue: 30
      },
    ];

    service.getInvoices().subscribe(invoices => {
      expect(invoices.length).toBe(1);
      expect(invoices).toEqual(dummyInvoices);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/invoices`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyInvoices);
  });

  it('should collect payment', () => {
    const dummyInvoice: Invoice = {
      id: 1,
      schoolId: 1,
      schoolName: 'School',
      invoiceNumber: 'INV-001',
      invoiceItem: 'Item 1',
      creationDate: '2024-05-13T00:00:00.000Z',
      dueDate: '2024-06-13T00:00:00.000Z',
      amount: 1000,
      paidAmount: 500,
      balance: 500,
      status: 'Pending',
      daysUntilDue: 30
    };

    const amount = 500;

    service.collectPayment(dummyInvoice, amount).subscribe(collection => {
      expect(collection).toBeTruthy();
    });

    const req1 = httpMock.expectOne(`${environment.apiUrl}/collections`);
    expect(req1.request.method).toBe('POST');
    req1.flush({});

    const req2 = httpMock.expectOne(`${environment.apiUrl}/invoices/${dummyInvoice.id}`);
    expect(req2.request.method).toBe('PATCH');
    req2.flush({});

    const req3 = httpMock.expectOne(`${environment.apiUrl}/schools/${dummyInvoice.schoolId}`);
    expect(req3.request.method).toBe('PATCH');
    req3.flush({});
  });
});
