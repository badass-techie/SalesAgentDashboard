export interface Collection {
  id: number;
  schoolId: number;
  invoiceId: number;
  invoiceNumber: string;
  collectionNumber: string;
  dateOfCollection: string;
  status: string;
  amount: number;
}
