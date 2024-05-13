import { TestBed } from '@angular/core/testing';

import { SchoolsService } from './schools.service';
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {Invoice} from "../shared/models/invoice";
import {School} from "../shared/models/school";
import {environment} from "../../environments/environment";
import {Collection} from "../shared/models/collection";

describe('SchoolsService', () => {
  let service: SchoolsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SchoolsService]
    });

    service = TestBed.inject(SchoolsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure that there are no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch schools', () => {
    const dummySchools: School[] = [
      {
        id: 1,
        name: 'School A',
        type: 'Type A',
        product: 'Product A',
        county: 'County A',
        registrationDate: '2024-05-13T00:00:00.000Z',
        contactInformation: 'Contact A',
        balance: 1000
      },
    ];

    service.getSchools().subscribe(schools => {
      expect(schools.length).toBe(1);
      expect(schools).toEqual(dummySchools);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/schools`);
    expect(req.request.method).toBe('GET');
    req.flush(dummySchools);
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

    const schoolId = 1;

    service.getInvoices(schoolId).subscribe(invoices => {
      expect(invoices.length).toBe(1);
      expect(invoices).toEqual(dummyInvoices);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/invoices?schoolId=${schoolId}`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyInvoices);
  });

  it('should create an invoice', () => {
    const school: School = {
      id: 1,
      name: 'School A',
      type: 'Type A',
      product: 'Product A',
      county: 'County A',
      registrationDate: '2024-05-13T00:00:00.000Z',
      contactInformation: 'Contact A',
      balance: 1000
    };
    const dummyInvoice: Invoice = {
      id: 1,
      schoolId: 1,
      schoolName: 'School',
      invoiceNumber: '001',
      invoiceItem: 'Item 1',
      creationDate: '2024-05-13T00:00:00.000Z',
      dueDate: '2024-06-13T00:00:00.000Z',
      amount: 1000,
      paidAmount: 500,
      balance: 500,
      status: 'Pending',
      daysUntilDue: 30
    };

    service.createInvoice(school, dummyInvoice).subscribe(invoice => {
      expect(invoice).toEqual(dummyInvoice);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/invoices`);
    expect(req.request.method).toBe('POST');
    req.flush(dummyInvoice);
  });

  it('should update an invoice', () => {
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

    service.updateInvoice(dummyInvoice).subscribe(invoice => {
      expect(invoice).toEqual(dummyInvoice);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/invoices/${dummyInvoice.id}`);
    expect(req.request.method).toBe('PATCH');
    req.flush(dummyInvoice);
  });

  it('should remove an invoice and its associated collections', () => {
    const invoiceId = 1;
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
      },
    ];

    service.removeInvoice(invoiceId).subscribe();

    const reqInvoice = httpMock.expectOne(`${environment.apiUrl}/invoices/${invoiceId}`);
    expect(reqInvoice.request.method).toBe('DELETE');
    reqInvoice.flush(null);

    const reqCollections = httpMock.expectOne(`${environment.apiUrl}/collections?invoiceId=${invoiceId}`);
    expect(reqCollections.request.method).toBe('GET');
    reqCollections.flush(dummyCollections);

    dummyCollections.forEach(collection => {
      const reqCollection = httpMock.expectOne(`${environment.apiUrl}/collections/${collection.id}`);
      expect(reqCollection.request.method).toBe('DELETE');
      reqCollection.flush(null);
    });
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
      },
    ];

    const schoolId = 1;

    service.getCollections(schoolId).subscribe(collections => {
      expect(collections.length).toBe(1);
      expect(collections).toEqual(dummyCollections);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/collections?schoolId=${schoolId}`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyCollections);
  });

  it('should update a collection', () => {
    const dummyCollection: Collection = {
      id: 1,
      schoolId: 1,
      invoiceId: 1,
      invoiceNumber: 'INV-001',
      collectionNumber: 'COL-001',
      dateOfCollection: '2024-05-13T00:00:00.000Z',
      status: 'Valid',
      amount: 1000
    };

    service.updateCollection(dummyCollection).subscribe(collection => {
      expect(collection).toEqual(dummyCollection);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/collections/${dummyCollection.id}`);
    expect(req.request.method).toBe('PATCH');
    req.flush(dummyCollection);
  });
});
