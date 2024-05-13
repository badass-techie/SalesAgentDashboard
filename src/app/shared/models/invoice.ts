export interface Invoice {
  id: number;
  schoolId: number;
  schoolName: string;
  invoiceNumber: string;
  invoiceItem: string;
  creationDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: string;
  daysUntilDue: number;
}
