import type { OfferLetterData, OfferLetterTerm } from "../types/offer-letter";

const today = new Date().toISOString().slice(0, 10);

function createTerm(title: string, content: string): OfferLetterTerm {
  return {
    id: crypto.randomUUID(),
    title,
    content,
  };
}

export function createDefaultOfferLetterData(): OfferLetterData {
  return {
    company: {
      name: "Mahi Solar Solution",
      logoUrl: "",
      address: "Plot 44, Radha Vihar, Govindpura, Jaipur, Rajasthan, 302012",
      phone: "+91 99284 13501",
      email: "mahisolarsolution@gmail.com",
      website: "",
      cin: "",
      gst: "",
      founderName: "Mahendra Kumawat",
      founderTitle: "Founder",
    },
    employeeName: "",
    employeeAddress: "",
    role: "",
    dateOfJoining: today,
    location: "",
    monthlySalary: 0,
    reportingTo: "",
    offerValidityDays: 15,
    responsibilities: `In this role, you will be responsible for:

- File login, file preparation, and submission to banks
- Document handling and loan management
- Administrative operations including:
  - Expense tracking
  - Site coordination
  - Data management
  - Attendance records
  - Inventory handling
  - Preparation of quotations

Ensuring smooth internal operations and accurate documentation will be a key part of your responsibilities.

You will report directly to the reporting manager and are expected to coordinate closely with management, finance, and site teams to ensure efficient day-to-day operations.`,
    leavePolicy: [
      "1 leave/holiday on Amavasya / Sunday per month",
      "1 paid leave per month",
      "1 Fun Day every month (Games / Team activity day)",
      "Major festival leaves as per company calendar",
      "Fun days and holidays are at the sole discretion of the Company and may be changed at any time. The Company may provide additional bonus or compensation in case of holiday or fun day cancellation, at its discretion.",
    ],
    salaryPolicy: [
      "After 6 months, there will be an increment of up to 10%, based on performance and company policy",
      "On completion of 1 year, there will be an approximate 50% salary increment, subject to performance and role continuity",
    ],
    otherBenefits: [
      "Gifts on Diwali",
      "Travel, rent, and food expenses covered for out-of-city site assignments",
      "Bonus on one-year completion, including salary-based bonus and performance bonus",
    ],
    insuranceCoverage: "Rs. 10,000/year",
    insuranceMinTenure: "6 months",
    terms: [
      createTerm(
        "Probation",
        "You will be on probation for an initial period of 2 months from your date of joining.\n\n- The probation period may be extended at the sole discretion of the Company based on performance, attendance, conduct, or business requirements.\n- Your employment will be confirmed only upon written communication from the Company.\n- During probation, your performance and suitability for the role will be reviewed on an ongoing basis.",
      ),
      createTerm(
        "Notice Period",
        "Either party may terminate employment by giving 1 month prior written notice.\n\n- If you leave without serving the required notice period, the Company may withhold salary or other dues to the extent permitted by law and company policy.\n- Final release and settlement will be subject to proper handover of work, documents, assets, and completion of all exit formalities.",
      ),
      createTerm(
        "Termination of Employment",
        "The Company reserves the right to terminate your employment at any time in accordance with applicable law.\n\n- Termination may occur due to business restructuring, lack of performance, misconduct, violation of company policy, unauthorized absence, or any act prejudicial to the interests of the Company.\n- The Company may decide whether notice, payment in lieu of notice, or immediate separation is appropriate depending on the circumstances.",
      ),
      createTerm(
        "Confidential Information",
        "You shall maintain strict confidentiality regarding all proprietary and confidential information of the Company.\n\n- This includes business plans, pricing, customer data, client lists, bank-related documents, internal processes, vendor information, financial records, and any non-public operational details.\n- This obligation continues during and after your employment.",
      ),
      createTerm(
        "Non-Disclosure Agreement (NDA)",
        "You shall not disclose, copy, circulate, publish, remove, or use any confidential information except for official company purposes.\n\n- You may not use such information for personal gain.\n- You may not share such information with any third party without written permission from the Company.\n- All documents, files, and records created or handled during your employment remain the property of the Company.",
      ),
      createTerm(
        "Conflict of Interest",
        "You are expected to avoid any situation that creates a conflict between your personal interests and the interests of the Company.\n\n- You must promptly disclose any existing or potential conflict of interest to management.\n- You may not engage in any activity, relationship, or arrangement that compromises your ability to perform your duties honestly and in the best interests of the Company.",
      ),
      createTerm(
        "Non-Competition",
        "During your employment, you shall not directly or indirectly engage in any business or assignment that competes with the Company.\n\n- You may not work for, advise, or support any competing entity without written approval.\n- You may not solicit the Company's clients, vendors, or employees for any competing purpose while employed with the Company.",
      ),
      createTerm(
        "Workplace Safety and Liability Disclaimer",
        "You acknowledge that certain duties may involve field visits, travel, site coordination, document handling, and physical movement in operational areas.\n\n- You agree to follow safety instructions, use due care, and immediately report unsafe conditions.\n- The Company shall not be liable for injury, loss, or damage arising from your negligence, willful misconduct, or failure to follow safety protocols, subject to applicable law.",
      ),
      createTerm(
        "Employee Insurance Policy",
        "The Company may provide insurance coverage up to the value stated in this offer letter, subject to eligibility and internal policy.\n\n- Insurance support is available up to Rs. 10,000 per year.\n- If you leave the Company before completing the minimum required tenure, you agree to reimburse the applicable insurance amount or deduction as decided by the Company.\n- Insurance benefits remain subject to policy terms, documentation, and approval requirements.",
      ),
    ],
    showAcceptance: true,
    showSeal: false,
    showSignature: false,
    sealUrl: "",
    signatureUrl: "",
    signatoryName: "Mahendra Kumawat",
    showPageNumbers: true,
  };
}
