import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { OfferLetterData } from "../../types/offer-letter";
import { BulletListEditor } from "./BulletListEditor";
import { ImageUploader } from "./ImageUploader";
import { TermsEditor } from "./TermsEditor";

interface OfferLetterEditorProps {
  data: OfferLetterData;
  onChange: (next: OfferLetterData) => void;
}

function AccordionSection({
  title,
  helper,
  children,
  defaultOpen = true,
}: {
  title: string;
  helper?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="editor-section">
      <button className="accordion-trigger" type="button" onClick={() => setOpen((value) => !value)}>
        <span>{title}</span>
        <ChevronDown size={18} style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.2s ease" }} />
      </button>
      {open ? (
        <div className="accordion-content">
          {helper ? <p className="helper-text">{helper}</p> : null}
          {children}
        </div>
      ) : null}
    </section>
  );
}

export function OfferLetterEditor({ data, onChange }: OfferLetterEditorProps) {
  function update<K extends keyof OfferLetterData>(key: K, value: OfferLetterData[K]) {
    onChange({ ...data, [key]: value });
  }

  function updateCompany<K extends keyof OfferLetterData["company"]>(key: K, value: OfferLetterData["company"][K]) {
    onChange({
      ...data,
      company: {
        ...data.company,
        [key]: value,
      },
    });
  }

  return (
    <div className="stack">
      <AccordionSection title="Letterhead / Header" helper="These details appear in the header on every page.">
        <ImageUploader label="Company Logo" value={data.company.logoUrl} onChange={(value) => updateCompany("logoUrl", value)} />
        <div className="field-grid">
          <div className="field">
            <label>Company Name *</label>
            <input value={data.company.name} onChange={(event) => updateCompany("name", event.target.value)} />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={data.company.phone} onChange={(event) => updateCompany("phone", event.target.value)} />
          </div>
          <div className="field">
            <label>Email</label>
            <input value={data.company.email} onChange={(event) => updateCompany("email", event.target.value)} />
          </div>
          <div className="field">
            <label>Website</label>
            <input value={data.company.website} onChange={(event) => updateCompany("website", event.target.value)} />
          </div>
          <div className="field full-span">
            <label>Address</label>
            <textarea rows={3} value={data.company.address} onChange={(event) => updateCompany("address", event.target.value)} />
          </div>
          <div className="field">
            <label>CIN</label>
            <input value={data.company.cin} onChange={(event) => updateCompany("cin", event.target.value)} />
          </div>
          <div className="field">
            <label>GST Number</label>
            <input value={data.company.gst} onChange={(event) => updateCompany("gst", event.target.value)} />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection title="Company & Signatory">
        <div className="field-grid">
          <div className="field">
            <label>Founder / Signatory Name</label>
            <input value={data.company.founderName} onChange={(event) => updateCompany("founderName", event.target.value)} />
          </div>
          <div className="field">
            <label>Title</label>
            <input value={data.company.founderTitle} onChange={(event) => updateCompany("founderTitle", event.target.value)} />
          </div>
          <div className="field">
            <label>Website</label>
            <input value={data.company.website} onChange={(event) => updateCompany("website", event.target.value)} />
          </div>
          <div className="field">
            <label>Signatory Name</label>
            <input value={data.signatoryName} onChange={(event) => update("signatoryName", event.target.value)} />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection title="Employee & Role">
        <div className="field-grid">
          <div className="field">
            <label>Employee Name *</label>
            <input value={data.employeeName} onChange={(event) => update("employeeName", event.target.value)} />
          </div>
          <div className="field">
            <label>Role / Position *</label>
            <input value={data.role} onChange={(event) => update("role", event.target.value)} />
          </div>
          <div className="field">
            <label>Date of Joining</label>
            <input type="date" value={data.dateOfJoining} onChange={(event) => update("dateOfJoining", event.target.value)} />
          </div>
          <div className="field">
            <label>Work Location</label>
            <input value={data.location} onChange={(event) => update("location", event.target.value)} />
          </div>
          <div className="field">
            <label>Monthly Salary</label>
            <input
              type="number"
              value={data.monthlySalary}
              onChange={(event) => update("monthlySalary", Number(event.target.value))}
            />
          </div>
          <div className="field">
            <label>Reporting To</label>
            <input value={data.reportingTo} onChange={(event) => update("reportingTo", event.target.value)} />
          </div>
          <div className="field">
            <label>Offer Validity in Days</label>
            <input
              type="number"
              value={data.offerValidityDays}
              onChange={(event) => update("offerValidityDays", Number(event.target.value))}
            />
          </div>
          <div className="field full-span">
            <label>Employee Address</label>
            <textarea rows={3} value={data.employeeAddress} onChange={(event) => update("employeeAddress", event.target.value)} />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Role, Responsibilities & Reporting"
        helper="Lines starting with '-' render as bullets. Use '  -' (2 spaces + dash) for sub-bullets."
      >
        <div className="field">
          <label>Responsibilities</label>
          <textarea rows={10} value={data.responsibilities} onChange={(event) => update("responsibilities", event.target.value)} />
        </div>
      </AccordionSection>

      <AccordionSection title="Policies & Benefits">
        <BulletListEditor label="Leave Policy" items={data.leavePolicy} onChange={(next) => update("leavePolicy", next)} />
        <BulletListEditor label="Salary Policy" items={data.salaryPolicy} onChange={(next) => update("salaryPolicy", next)} />
        <BulletListEditor label="Other Benefits" items={data.otherBenefits} onChange={(next) => update("otherBenefits", next)} />
        <div className="field-grid">
          <div className="field">
            <label>Insurance Coverage</label>
            <input value={data.insuranceCoverage} onChange={(event) => update("insuranceCoverage", event.target.value)} />
          </div>
          <div className="field">
            <label>Minimum Tenure for Insurance</label>
            <input value={data.insuranceMinTenure} onChange={(event) => update("insuranceMinTenure", event.target.value)} />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection title="Terms & Conditions">
        <TermsEditor terms={data.terms} onChange={(next) => update("terms", next)} />
      </AccordionSection>

      <AccordionSection title="Settings">
        <div className="toggle-grid">
          {[
            ["Show Acceptance Section", "showAcceptance"],
            ["Show Seal", "showSeal"],
            ["Show Signature", "showSignature"],
            ["Show Page Numbers", "showPageNumbers"],
          ].map(([label, key]) => {
            const typedKey = key as keyof OfferLetterData;
            const current = Boolean(data[typedKey]);

            return (
              <div className="toggle-row" key={key}>
                <span>{label}</span>
                <button className={`toggle ${current ? "on" : ""}`} type="button" onClick={() => update(typedKey, (!current) as never)}>
                  <span className="toggle-thumb" />
                </button>
              </div>
            );
          })}
        </div>
        <div style={{ height: 16 }} />
        <ImageUploader label="Seal Image" value={data.sealUrl} onChange={(value) => update("sealUrl", value)} />
        <ImageUploader label="Signature Image" value={data.signatureUrl} onChange={(value) => update("signatureUrl", value)} />
        <div className="field">
          <label>Signatory Name</label>
          <input value={data.signatoryName} onChange={(event) => update("signatoryName", event.target.value)} />
        </div>
      </AccordionSection>
    </div>
  );
}
