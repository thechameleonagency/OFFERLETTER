import type { ChangeEvent } from "react";
import { Trash2, UploadCloud } from "lucide-react";

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (next: string) => void;
}

export function ImageUploader({ label, value, onChange }: ImageUploaderProps) {
  async function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    onChange(dataUrl);
    event.target.value = "";
  }

  return (
    <div className="upload-card">
      <div>
        <strong>{label}</strong>
        <p className="helper-text" style={{ margin: "6px 0 0" }}>
          Supports PNG, SVG, and JPG.
        </p>
      </div>
      {value ? (
        <div className="upload-preview">
          <img src={value} alt={label} />
          <button className="danger-button" type="button" onClick={() => onChange("")}>
            <Trash2 size={16} />
            Remove
          </button>
        </div>
      ) : (
        <label className="primary-button" style={{ cursor: "pointer" }}>
          <UploadCloud size={16} />
          Upload
          <input
            hidden
            accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
            type="file"
            onChange={handleSelect}
          />
        </label>
      )}
    </div>
  );
}
