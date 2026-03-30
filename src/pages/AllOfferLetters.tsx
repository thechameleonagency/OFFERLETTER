import { useMemo, useState } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { formatRecordDate } from "../lib/offer-letter-formatters";
import { deleteOfferLetterRecord, listOfferLetters } from "../lib/offer-letter-storage";

export function AllOfferLetters() {
  const navigate = useNavigate();
  const [refreshToken, setRefreshToken] = useState(0);
  const records = useMemo(() => listOfferLetters(), [refreshToken]);

  function handleDelete(id: string) {
    if (!window.confirm("Delete this saved offer letter?")) {
      return;
    }

    deleteOfferLetterRecord(id);
    setRefreshToken((value) => value + 1);
  }

  return (
    <div className="page-shell">
      <div className="maker-toolbar" style={{ marginBottom: 24 }}>
        <div className="maker-heading">
          <p className="eyebrow">Saved Documents</p>
          <h1>Offer Letters</h1>
          <p>Open any saved letter, continue editing it, or delete old drafts you no longer need.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => navigate("/offer-letter")}>
          <Plus size={16} />
          New Offer Letter
        </button>
      </div>

      {records.length === 0 ? (
        <div className="empty-card">
          <p className="eyebrow">Nothing Saved Yet</p>
          <h2 style={{ marginTop: 0 }}>Create your first offer letter</h2>
          <p className="muted-text">
            Saved offer letters will appear here with their latest update time so you can reopen them quickly.
          </p>
          <Link className="primary-button" to="/offer-letter">
            <FileText size={16} />
            Start Creating
          </Link>
        </div>
      ) : (
        <div className="saved-grid">
          {records.map((record) => (
            <article className="saved-card" key={record.id}>
              <div>
                <p className="eyebrow">Offer Letter</p>
                <h3>{record.name || "Untitled Offer Letter"}</h3>
                <p className="muted-text" style={{ marginBottom: 0 }}>
                  Last updated {formatRecordDate(record.updatedAt)}
                </p>
              </div>
              <div className="saved-card-actions">
                <Link className="primary-button" to={`/offer-letter/${record.id}`}>
                  Open
                </Link>
                <button className="danger-button" type="button" onClick={() => handleDelete(record.id)}>
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
