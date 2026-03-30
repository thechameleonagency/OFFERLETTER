import type { DragEvent } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";

interface BulletListEditorProps {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
}

export function BulletListEditor({ label, items, onChange }: BulletListEditorProps) {
  function updateItem(index: number, value: string) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function deleteItem(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function addItem() {
    onChange([...items, ""]);
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

    const next = [...items];
    const [moved] = next.splice(startIndex, 1);
    next.splice(index, 0, moved);
    onChange(next);
  }

  return (
    <div className="stack">
      <div className="section-title-row">
        <div>
          <strong>{label}</strong>
        </div>
        <button className="ghost-button" type="button" onClick={addItem}>
          <Plus size={16} />
          Add Point
        </button>
      </div>
      <div className="list-editor">
        {items.map((item, index) => (
          <div
            key={`${label}-${index}`}
            className="list-item-row"
            draggable
            onDragOver={(event) => event.preventDefault()}
            onDragStart={(event) => handleDragStart(index, event)}
            onDrop={(event) => handleDrop(index, event)}
          >
            <GripVertical className="drag-handle" size={18} />
            <input
              aria-label={`${label} item ${index + 1}`}
              value={item}
              onChange={(event) => updateItem(index, event.target.value)}
            />
            <button className="icon-button" type="button" onClick={() => deleteItem(index)}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
