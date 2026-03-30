import type { CSSProperties } from "react";
import { filledValue, formatCurrency, formatDate } from "../../lib/offer-letter-formatters";
import { renderRichText } from "../../lib/offer-letter-parser";
import type { OfferLetterData } from "../../types/offer-letter";

interface OfferLetterPreviewProps {
  data: OfferLetterData;
}

const bodyStyle: CSSProperties = {
  padding: "24px 56px",
};

const headingStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  letterSpacing: 1,
  margin: "0 0 14px",
  color: "#152036",
};

const separator: CSSProperties = {
  border: "none",
  borderTop: "1px solid #e5e7eb",
  margin: "18px 0",
};

export function OfferLetterPreview({ data }: OfferLetterPreviewProps) {
  const signatory = filledValue(data.signatoryName || data.company.founderName);

  return (
    <div
      id="offer-letter-preview"
      style={{
        width: 800,
        background: "#ffffff",
        color: "#111827",
        fontFamily: "Lexend, sans-serif",
        boxShadow: "0 24px 60px rgba(15, 23, 42, 0.14)",
        overflow: "visible",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          textAlign: "center",
          borderBottom: "2px solid #e5e7eb",
          padding: "24px 0 18px",
          overflow: "visible",
        }}
      >
        {data.company.logoUrl ? (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, overflow: "visible" }}>
            <img
              alt="Company logo"
              crossOrigin="anonymous"
              src={data.company.logoUrl}
              style={{ maxHeight: 64, width: "auto", objectFit: "contain", overflow: "visible" }}
            />
          </div>
        ) : null}
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
          {filledValue(data.company.name)}
        </div>
        <div style={{ fontSize: 10, marginTop: 8 }}>{filledValue(data.company.address)}</div>
        <div style={{ fontSize: 10, marginTop: 4 }}>
          {[filledValue(data.company.phone), filledValue(data.company.email)].join(" | ")}
        </div>
        {data.company.cin || data.company.gst ? (
          <div style={{ fontSize: 9.5, marginTop: 4 }}>
            {[data.company.cin ? `CIN: ${data.company.cin}` : "", data.company.gst ? `GST: ${data.company.gst}` : ""]
              .filter(Boolean)
              .join(" | ")}
          </div>
        ) : null}
      </div>

      <div style={bodyStyle}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 3 }}>OFFER LETTER</div>
        </div>

        <div style={{ marginBottom: 16, lineHeight: 1.7 }}>
          <p style={{ margin: "0 0 4px" }}>To,</p>
          <p style={{ margin: "0 0 4px", fontWeight: 700 }}>{filledValue(data.employeeName)}</p>
          <p style={{ margin: 0, whiteSpace: "pre-line" }}>{filledValue(data.employeeAddress)}</p>
        </div>

        <p style={{ margin: "0 0 14px", lineHeight: 1.7 }}>
          <strong>Subject:</strong> Offer for the role of <strong>{filledValue(data.role)}</strong>
        </p>
        <p style={{ margin: "0 0 14px", lineHeight: 1.7 }}>
          Dear <strong>{filledValue(data.employeeName)}</strong>,
        </p>
        <p style={{ margin: "0 0 14px", lineHeight: 1.8 }}>
          {filledValue(data.company.name)} is pleased to offer you the position of <strong>{filledValue(data.role)}</strong>{" "}
          with our organization.
        </p>

        <div style={{ marginBottom: 14, lineHeight: 1.8 }}>
          <p style={{ margin: "0 0 4px" }}>
            <strong>Date of Joining:</strong> {formatDate(data.dateOfJoining)}
          </p>
          {data.location ? (
            <p style={{ margin: "0 0 4px" }}>
              <strong>Location:</strong> {filledValue(data.location)}
            </p>
          ) : null}
          <p style={{ margin: 0 }}>
            <strong>Monthly Salary:</strong> {formatCurrency(data.monthlySalary)}
          </p>
        </div>

        <p style={{ margin: "0 0 18px", color: "#6b7280", fontStyle: "italic", lineHeight: 1.7 }}>
          This offer is valid for <strong>{data.offerValidityDays || 15} days</strong> from the date of issuance. Kindly
          confirm your acceptance within this period.
        </p>

        <hr style={separator} />

        <div>
          <h2 style={headingStyle}>ROLE, RESPONSIBILITIES & REPORTING</h2>
          {renderRichText(data.responsibilities, "responsibilities")}
        </div>

        <p style={{ margin: "18px 0 10px", lineHeight: 1.8 }}>
          You will report directly to <strong>{filledValue(data.reportingTo)}</strong> and are expected to support the
          company with dedication, accuracy, and professionalism.
        </p>
        <p style={{ margin: "0 0 26px", lineHeight: 1.8 }}>
          We look forward to having you as part of the team and hope for a successful and mutually rewarding association.
        </p>

        <div style={{ position: "relative", minHeight: 130, marginTop: 18 }}>
          <p style={{ margin: "0 0 18px", lineHeight: 1.7 }}>Warm regards,</p>
          {data.showSignature && data.signatureUrl ? (
            <img
              alt="Signature"
              crossOrigin="anonymous"
              src={data.signatureUrl}
              style={{ position: "absolute", top: 16, left: 0, maxHeight: 56, objectFit: "contain" }}
            />
          ) : null}
          {data.showSeal && data.sealUrl ? (
            <img
              alt="Seal"
              crossOrigin="anonymous"
              src={data.sealUrl}
              style={{ position: "absolute", top: 10, left: 120, maxHeight: 76, objectFit: "contain", opacity: 0.95 }}
            />
          ) : null}
          <div style={{ position: "absolute", bottom: 0, left: 0 }}>
            <p style={{ margin: "0 0 4px", fontWeight: 700 }}>{signatory}</p>
            <p style={{ margin: "0 0 4px" }}>{filledValue(data.company.founderTitle)}</p>
            <p style={{ margin: "0 0 4px" }}>{filledValue(data.company.name)}</p>
            <p style={{ margin: 0 }}>{filledValue(data.company.phone)}</p>
          </div>
        </div>
      </div>

      <div data-page-break="true" style={{ height: 1 }} />

      <div style={bodyStyle}>
        <h2 style={headingStyle}>COMPANY POLICIES & BENEFITS</h2>
        {[
          { title: "Leave Policy", items: data.leavePolicy },
          { title: "Salary Policy", items: data.salaryPolicy },
          { title: "Other Benefits", items: data.otherBenefits },
        ].map((section, index) => (
          <div key={section.title}>
            <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700 }}>{section.title}</h3>
            <ul style={{ margin: "0 0 14px", paddingLeft: 20, lineHeight: 1.8 }}>
              {section.items.map((item, itemIndex) => (
                <li key={`${section.title}-${itemIndex}`}>{filledValue(item)}</li>
              ))}
            </ul>
            {index < 2 ? <hr style={separator} /> : null}
          </div>
        ))}

        <p style={{ margin: "14px 0 4px", lineHeight: 1.8 }}>
          <strong>Insurance Coverage:</strong> {filledValue(data.insuranceCoverage)}
        </p>
        <p style={{ margin: "0 0 18px", lineHeight: 1.8 }}>
          <strong>Minimum Tenure for Insurance:</strong> {filledValue(data.insuranceMinTenure)}
        </p>

        <hr style={separator} />

        <h2 style={headingStyle}>TERMS AND CONDITIONS</h2>
        <div>
          {data.terms.map((term, index) => (
            <div key={term.id}>
              <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700 }}>
                {index + 1}. {filledValue(term.title)}
              </h3>
              {renderRichText(term.content, term.id)}
              {index < data.terms.length - 1 ? <hr style={separator} /> : null}
            </div>
          ))}
        </div>

        {data.showAcceptance ? (
          <div style={{ marginTop: 24 }}>
            <hr style={separator} />
            <h2 style={headingStyle}>ACCEPTANCE</h2>
            <p style={{ margin: "0 0 22px", lineHeight: 1.8 }}>
              I, <strong>{filledValue(data.employeeName)}</strong>, accept the offer made to me for the role of{" "}
              <strong>{filledValue(data.role)}</strong> and agree to abide by the terms and conditions mentioned in this
              letter.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, marginTop: 34 }}>
              <div>
                <div style={{ borderTop: "1px solid #111827", paddingTop: 8 }}>Employee Signature</div>
              </div>
              <div>
                <div style={{ borderTop: "1px solid #111827", paddingTop: 8 }}>Date</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
