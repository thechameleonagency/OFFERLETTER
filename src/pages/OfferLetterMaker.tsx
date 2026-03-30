import { ArrowLeft, Columns2, Eye, FileDown, Maximize2, Save } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBeforeUnload, useNavigate, useParams } from "react-router-dom";
import { OfferLetterEditor } from "../components/offer-letter/OfferLetterEditor";
import { OfferLetterPreview } from "../components/offer-letter/OfferLetterPreview";
import { SaveOfferLetterDialog } from "../components/offer-letter/SaveOfferLetterDialog";
import { buildLegacyResponsibilities, createDefaultOfferLetterData, normalizeOfferLetterData } from "../lib/offer-letter-defaults";
import { exportOfferLetterPdf, exportOfferLetterTextPdf } from "../lib/export-offer-letter-pdf";
import { clearDraft, getDraft, getOfferLetter, saveDraft, saveOfferLetterRecord } from "../lib/offer-letter-storage";
import type { OfferLetterData } from "../types/offer-letter";

function cloneData(data: OfferLetterData) {
  return JSON.parse(JSON.stringify(data)) as OfferLetterData;
}

export function OfferLetterMaker() {
  const params = useParams();
  const navigate = useNavigate();
  const previewRef = useRef<HTMLDivElement | null>(null);
  const record = params.id ? getOfferLetter(params.id) : null;
  const initialData = useMemo(() => {
    if (record) {
      return normalizeOfferLetterData(cloneData(record.content));
    }

    const draft = getDraft();
    return draft ? normalizeOfferLetterData(draft) : createDefaultOfferLetterData();
  }, [record]);

  const [data, setData] = useState<OfferLetterData>(initialData);
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split");
  const [exportMode, setExportMode] = useState<"dom" | "text">("dom");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(initialData));
  const isDirty = JSON.stringify(data) !== savedSnapshot;

  useEffect(() => {
    setData(initialData);
    setSavedSnapshot(JSON.stringify(initialData));
  }, [initialData]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!record) {
        saveDraft({ ...data, responsibilities: buildLegacyResponsibilities(data) });
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [data, record]);

  useBeforeUnload(
    (event) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    },
    { capture: true },
  );

  async function handleExport() {
    setViewMode("preview");
    setIsExporting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));

    const previewNode = previewRef.current?.querySelector("#offer-letter-preview");
    if (!(previewNode instanceof HTMLElement)) {
      setIsExporting(false);
      return;
    }

    try {
      if (exportMode === "text") {
        await exportOfferLetterTextPdf(previewNode, data.employeeName || "offer-letter", data.showPageNumbers);
      } else {
        await exportOfferLetterPdf(previewNode, data.employeeName || "offer-letter", data.showPageNumbers);
      }
    } finally {
      setIsExporting(false);
    }
  }

  function handleSave(name: string) {
    const saved = saveOfferLetterRecord({
      id: record?.id,
      name,
      content: { ...data, responsibilities: buildLegacyResponsibilities(data) },
    });

    clearDraft();
    setSavedSnapshot(JSON.stringify(data));
    setSaveDialogOpen(false);

    if (!record) {
      navigate(`/offer-letter/${saved.id}`, { replace: true });
    }
  }

  function handleBack() {
    if (isDirty && !window.confirm("You have unsaved changes. Go back to all letters anyway?")) {
      return;
    }

    navigate("/offer-letters");
  }

  return (
    <div className="page-shell">
      <div className="sticky-topbar">
        <button className="ghost-button" type="button" onClick={handleBack}>
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="topbar-actions">
          <div className={`status-pill ${isDirty ? "dirty" : ""}`}>{isDirty ? "Unsaved changes" : "All changes saved"}</div>
          <div className="segmented-control">
            <button className={`segment-button ${viewMode === "split" ? "active" : ""}`} type="button" onClick={() => setViewMode("split")}>
              <Columns2 size={16} />
              Split
            </button>
            <button className={`segment-button ${viewMode === "editor" ? "active" : ""}`} type="button" onClick={() => setViewMode("editor")}>
              <Maximize2 size={16} />
              Editor
            </button>
            <button className={`segment-button ${viewMode === "preview" ? "active" : ""}`} type="button" onClick={() => setViewMode("preview")}>
              <Eye size={16} />
              Preview
            </button>
          </div>
          <select className="export-select" value={exportMode} onChange={(event) => setExportMode(event.target.value as "dom" | "text")}>
            <option value="dom">DOM Export</option>
            <option value="text">Text-based PDF</option>
          </select>
          <button className="ghost-button" type="button" onClick={handleExport} disabled={isExporting}>
            <FileDown size={16} />
            {isExporting ? "Exporting..." : exportMode === "text" ? "Export Text PDF" : "Export PDF"}
          </button>
          <button className="primary-button" type="button" onClick={() => setSaveDialogOpen(true)}>
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      <div className={`layout-grid ${viewMode === "editor" ? "editor-only-grid" : viewMode === "preview" ? "preview-only-grid" : ""}`}>
        {viewMode !== "preview" ? (
          <section className="content-card editor-shell">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Editor</p>
                <h2>Offer Letter Details</h2>
              </div>
              <p className="muted-text">Fill each section in order and the document updates automatically.</p>
            </div>
            <OfferLetterEditor data={data} onChange={setData} />
          </section>
        ) : null}

        {viewMode !== "editor" ? (
          <section className="content-card preview-shell" ref={previewRef}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Preview</p>
              <h2>Page-by-Page Document</h2>
            </div>
            <p className="muted-text">This preview is the exact source used for PDF export.</p>
          </div>
          <div className="preview-scale-note">
            A4-based pages are rendered here exactly as export pages, so review layout and page breaks before downloading.
          </div>
          <div style={{ width: "100%", display: "grid", justifyItems: "center" }}>
            <OfferLetterPreview data={data} />
          </div>
        </section>
        ) : null}
      </div>

      <SaveOfferLetterDialog
        defaultName={data.employeeName || record?.name || "Untitled Offer Letter"}
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
