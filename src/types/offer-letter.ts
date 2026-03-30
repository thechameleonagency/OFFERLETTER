export interface OfferLetterCompany {
  name: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  cin: string;
  gst: string;
  founderName: string;
  founderTitle: string;
}

export interface OfferLetterTerm {
  id: string;
  title: string;
  content: string;
}

export interface OfferLetterData {
  company: OfferLetterCompany;
  employeeName: string;
  employeeAddress: string;
  role: string;
  dateOfJoining: string;
  location: string;
  monthlySalary: number;
  reportingTo: string;
  offerValidityDays: number;
  responsibilities: string;
  leavePolicy: string[];
  salaryPolicy: string[];
  otherBenefits: string[];
  insuranceCoverage: string;
  insuranceMinTenure: string;
  terms: OfferLetterTerm[];
  showAcceptance: boolean;
  showSeal: boolean;
  showSignature: boolean;
  sealUrl: string;
  signatureUrl: string;
  signatoryName: string;
  showPageNumbers: boolean;
}

export interface OfferLetterRecord {
  id: string;
  name: string;
  content: OfferLetterData;
  createdAt: string;
  updatedAt: string;
}
