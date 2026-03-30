import { useEffect, useState } from "react";

interface SaveOfferLetterDialogProps {
  open: boolean;
  defaultName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

export function SaveOfferLetterDialog({ open, defaultName, onClose, onSave }: SaveOfferLetterDialogProps) {
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    if (open) {
      setName(defaultName);
    }
  }, [defaultName, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="dialog-overlay" role="presentation" onClick={onClose}>
      <div className="dialog-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <p className="eyebrow">Save Offer Letter</p>
        <h2 style={{ marginTop: 0 }}>Save this document</h2>
        <p className="muted-text">Choose a clear document name. This will appear in your saved offer letters list.</p>
        <div className="field">
          <label>Document Name</label>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Employee name" />
        </div>
        <div className="dialog-actions">
          <button className="ghost-button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={() => onSave(name.trim() || defaultName || "Untitled Offer Letter")}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
