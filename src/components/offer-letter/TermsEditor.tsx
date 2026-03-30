import type { DragEvent } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import type { OfferLetterTerm } from "../../types/offer-letter";

interface TermsEditorProps {
  terms: OfferLetterTerm[];
  onChange: (next: OfferLetterTerm[]) => void;
}

export function TermsEditor({ terms, onChange }: TermsEditorProps) {
  function updateTerm(index: number, key: keyof OfferLetterTerm, value: string) {
    onChange(terms.map((term, termIndex) => (termIndex === index ? { ...term, [key]: value } : term)));
  }

  function addTerm() {
    onChange([
      ...terms,
      {
        id: crypto.randomUUID(),
        title: "",
        content: "",
      },
    ]);
  }

  function deleteTerm(index: number) {
    onChange(terms.filter((_, termIndex) => termIndex !== index));
  }

  function handleDragStart(index: number, event: DragEvent<HTMLDivElement>) {
    event.dataTransfer.setData("text/plain", String(index));
  }

  function handleDrop(index: number, event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const startIndex = Number(event.dataTransfer.getData("text/plain"));
    if (Number.isNaN(startIndex) || startIndex === index) {
      return;
    }

    const next = [...terms];
    const [moved] = next.splice(startIndex, 1);
    next.splice(index, 0, moved);
    onChange(next);
  }

  return (
    <div className="stack">
      {terms.map((term, index) => (
        <div
          key={term.id}
          className="term-card"
          draggable
          onDragOver={(event) => event.preventDefault()}
          onDragStart={(event) => handleDragStart(index, event)}
          onDrop={(event) => handleDrop(index, event)}
        >
          <div className="section-title-row">
            <strong>
              <GripVertical className="drag-handle" size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Clause {index + 1}
            </strong>
            <button className="icon-button" type="button" onClick={() => deleteTerm(index)}>
              <Trash2 size={16} />
            </button>
          </div>
          <div className="field">
            <label>Clause Title</label>
            <input value={term.title} onChange={(event) => updateTerm(index, "title", event.target.value)} />
          </div>
          <div className="field">
            <label>Clause Content</label>
            <textarea
              rows={4}
              value={term.content}
              onChange={(event) => updateTerm(index, "content", event.target.value)}
            />
          </div>
        </div>
      ))}
      <button className="ghost-button" type="button" onClick={addTerm}>
        <Plus size={16} />
        Add Clause
      </button>
    </div>
  );
}
