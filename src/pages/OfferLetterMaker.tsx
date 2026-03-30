import { ArrowLeft, Eye, FileDown, PencilLine, Save } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBeforeUnload, useBlocker, useNavigate, useParams } from "react-router-dom";
import { OfferLetterEditor } from "../components/offer-letter/OfferLetterEditor";
import { OfferLetterPreview } from "../components/offer-letter/OfferLetterPreview";
import { SaveOfferLetterDialog } from "../components/offer-letter/SaveOfferLetterDialog";
import { createDefaultOfferLetterData } from "../lib/offer-letter-defaults";
import { exportOfferLetterPdf } from "../lib/export-offer-letter-pdf";
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
      return cloneData(record.content);
    }

    const draft = getDraft();
    return draft ?? createDefaultOfferLetterData();
  }, [record]);

  const [data, setData] = useState<OfferLetterData>(initialData);
  const [showPreview, setShowPreview] = useState(true);
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
        saveDraft(data);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [data, record]);

  useBeforeUnload(
    (event) => {
      if (isDirty) {
        event.preventDefault();
      }
    },
    { capture: true },
  );

  const blocker = useBlocker(isDirty);
  useEffect(() => {
    if (blocker.state === "blocked") {
      if (window.confirm("You have unsaved changes. Leave this page?")) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  async function handleExport() {
    setShowPreview(true);
    setIsExporting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));

    const previewNode = previewRef.current?.querySelector("#offer-letter-preview");
    if (!(previewNode instanceof HTMLElement)) {
      setIsExporting(false);
      return;
    }

    try {
      await exportOfferLetterPdf(previewNode, data.employeeName || "offer-letter", data.showPageNumbers);
    } finally {
      setIsExporting(false);
    }
  }

  function handleSave(name: string) {
    const saved = saveOfferLetterRecord({
      id: record?.id,
      name,
      content: data,
    });

    clearDraft();
    setSavedSnapshot(JSON.stringify(data));
    setSaveDialogOpen(false);

    if (!record) {
      navigate(`/offer-letter/${saved.id}`, { replace: true });
    }
  }

  function handleBack() {
    if (isDirty && !window.confirm("You have unsaved changes. Go back to home anyway?")) {
      return;
    }

    navigate("/");
  }

  return (
    <div className="page-shell">
      <div className="sticky-topbar">
        <div>
          <button className="ghost-button" type="button" onClick={handleBack} style={{ marginBottom: 12 }}>
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="maker-heading">
            <h1>Offer Letter</h1>
            <div className={`status-pill ${isDirty ? "dirty" : ""}`}>{isDirty ? "Unsaved changes" : "All changes saved"}</div>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button" type="button" onClick={() => setShowPreview((value) => !value)}>
            {showPreview ? <PencilLine size={16} /> : <Eye size={16} />}
            {showPreview ? "Editor" : "Preview"}
          </button>
          <button className="ghost-button" type="button" onClick={handleExport} disabled={isExporting}>
            <FileDown size={16} />
            {isExporting ? "Exporting..." : "Export PDF"}
          </button>
          <button className="primary-button" type="button" onClick={() => setSaveDialogOpen(true)}>
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      <div className="layout-grid">
        {!showPreview ? (
          <section className="content-card editor-shell">
            <div className="scroll-area">
              <OfferLetterEditor data={data} onChange={setData} />
            </div>
          </section>
        ) : null}

        <section className="content-card preview-shell" ref={previewRef} style={{ gridColumn: showPreview ? "1 / -1" : undefined }}>
          <div className="preview-scale-note">
            Preview is rendered at a fixed 800px document width for export fidelity. PDF output uses the same preview DOM.
          </div>
          <div className="scroll-area" style={{ width: "100%", display: "grid", justifyItems: "center" }}>
            <OfferLetterPreview data={data} />
          </div>
        </section>
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
