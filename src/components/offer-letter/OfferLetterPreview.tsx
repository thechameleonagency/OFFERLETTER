import type { CSSProperties, ReactNode } from "react";
import { filledValue, formatCurrency, formatDate } from "../../lib/offer-letter-formatters";
import { renderRichText } from "../../lib/offer-letter-parser";
import type { OfferLetterData, OfferLetterTerm } from "../../types/offer-letter";

interface OfferLetterPreviewProps {
  data: OfferLetterData;
}

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const HEADER_HEIGHT = 150;
const BODY_MIN_HEIGHT = PAGE_HEIGHT - HEADER_HEIGHT;
const FOLLOW_UP_PAGE_BODY_CAPACITY = 860;

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

function estimateTextLines(text: string, charsPerLine: number) {
  return Math.max(1, Math.ceil(text.trim().length / charsPerLine));
}

function estimateRichTextHeight(text: string) {
  return text.split("\n").reduce((total, rawLine) => {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      return total + 10;
    }

    if (line.match(/^\s*-\s+/)) {
      return total + estimateTextLines(line.replace(/^\s*-\s+/, ""), 58) * 22;
    }

    return total + estimateTextLines(line, 72) * 22;
  }, 0);
}

function estimatePolicySectionHeight(title: string, items: string[]) {
  return (
    34 +
    estimateTextLines(title, 36) * 22 +
    items.reduce((total, item) => total + estimateTextLines(item, 64) * 22, 0) +
    18
  );
}

function estimateTermHeight(term: OfferLetterTerm) {
  return 30 + estimateRichTextHeight(term.content) + 26;
}

function estimateAcceptanceHeight(data: OfferLetterData) {
  return 170 + estimateTextLines(`${data.employeeName} ${data.role}`, 56) * 18;
}

function chunkTermsByPage(terms: OfferLetterTerm[], firstPageCapacity: number, nextPageCapacity: number) {
  const pages: OfferLetterTerm[][] = [];
  let currentPage: OfferLetterTerm[] = [];
  let remaining = firstPageCapacity;

  for (const term of terms) {
    const termHeight = estimateTermHeight(term);

    if (currentPage.length > 0 && termHeight > remaining) {
      pages.push(currentPage);
      currentPage = [term];
      remaining = nextPageCapacity - termHeight;
      continue;
    }

    currentPage.push(term);
    remaining -= termHeight;

    if (remaining < 120) {
      pages.push(currentPage);
      currentPage = [];
      remaining = nextPageCapacity;
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages.length > 0 ? pages : [[]];
}

function Header({ data }: { data: OfferLetterData }) {
  return (
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
  );
}

function Page({
  children,
  data,
  pageIndex,
}: {
  children: ReactNode;
  data: OfferLetterData;
  pageIndex: number;
}) {
  return (
    <div
      data-page-break={pageIndex > 0 ? "true" : undefined}
      style={{
        width: PAGE_WIDTH,
        minHeight: PAGE_HEIGHT,
        background: "#ffffff",
        color: "#111827",
        fontFamily: "Lexend, sans-serif",
        boxShadow: "0 24px 60px rgba(15, 23, 42, 0.14)",
        overflow: "hidden",
      }}
    >
      <Header data={data} />
      <div style={{ ...bodyStyle, minHeight: BODY_MIN_HEIGHT }}>{children}</div>
    </div>
  );
}

export function OfferLetterPreview({ data }: OfferLetterPreviewProps) {
  const signatory = filledValue(data.signatoryName || data.company.founderName);
  const policiesIntroHeight =
    48 +
    estimatePolicySectionHeight("Leave Policy", data.leavePolicy) +
    estimatePolicySectionHeight("Salary Policy", data.salaryPolicy) +
    estimatePolicySectionHeight("Other Benefits", data.otherBenefits) +
    88;
  const termsHeadingHeight = 52;
  const firstTermsCapacity = Math.max(220, FOLLOW_UP_PAGE_BODY_CAPACITY - policiesIntroHeight - termsHeadingHeight);
  const termPages = chunkTermsByPage(data.terms, firstTermsCapacity, FOLLOW_UP_PAGE_BODY_CAPACITY - 52);
  const lastPageTermHeight = termPages[termPages.length - 1].reduce((sum, term) => sum + estimateTermHeight(term), 0);
  const needsAcceptancePage =
    data.showAcceptance && lastPageTermHeight + estimateAcceptanceHeight(data) > FOLLOW_UP_PAGE_BODY_CAPACITY - 52;

  return (
    <div
      id="offer-letter-preview"
      style={{
        width: PAGE_WIDTH,
        display: "grid",
        gap: 28,
        overflow: "visible",
      }}
    >
      <Page data={data} pageIndex={0}>
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
          <div style={{ position: "absolute", bottom: 0, left: 0 }}>
            <p style={{ margin: "0 0 4px", fontWeight: 700 }}>{signatory}</p>
            <p style={{ margin: "0 0 4px" }}>{filledValue(data.company.founderTitle)}</p>
            <p style={{ margin: "0 0 4px" }}>{filledValue(data.company.name)}</p>
            <p style={{ margin: 0 }}>{filledValue(data.company.phone)}</p>
          </div>
        </div>
      </Page>

      <Page data={data} pageIndex={1}>
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
          {termPages[0].map((term, index) => (
            <div key={term.id}>
              <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700 }}>
                {data.terms.indexOf(term) + 1}. {filledValue(term.title)}
              </h3>
              {renderRichText(term.content, term.id)}
              {index < termPages[0].length - 1 ? <hr style={separator} /> : null}
            </div>
          ))}
        </div>
      </Page>

      {termPages.slice(1).map((pageTerms, pageOffset) => {
        const isLastTermsPage = pageOffset === termPages.length - 2;

        return (
          <Page data={data} key={`terms-page-${pageOffset + 2}`} pageIndex={pageOffset + 2}>
            <h2 style={headingStyle}>TERMS AND CONDITIONS</h2>
            <div>
              {pageTerms.map((term, index) => (
                <div key={term.id}>
                  <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700 }}>
                    {data.terms.indexOf(term) + 1}. {filledValue(term.title)}
                  </h3>
                  {renderRichText(term.content, `${term.id}-page-${pageOffset}`)}
                  {index < pageTerms.length - 1 ? <hr style={separator} /> : null}
                </div>
              ))}
            </div>

            {data.showAcceptance && !needsAcceptancePage && isLastTermsPage ? (
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
          </Page>
        );
      })}

      {data.showAcceptance && (needsAcceptancePage || termPages.length === 1) ? (
        <Page data={data} pageIndex={termPages.length + 1}>
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
        </Page>
      ) : null}
    </div>
  );
}
