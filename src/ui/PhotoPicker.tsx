import { useId, useState } from 'react';
import { ImageIcon, TrashIcon } from './icons';

const MAX_SIDE = 1200;
const MAX_INPUT_BYTES = 25 * 1024 * 1024;

/** Reads an image file and downscales it to a JPEG data URL so stored projects stay small. */
export async function fileToPhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file (JPG, PNG, HEIC…).');
  if (file.size > MAX_INPUT_BYTES) throw new Error('That image is larger than 25 MB. Please pick a smaller one.');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('That image could not be read. Try a JPG or PNG.'));
      el.src = url;
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('This browser cannot process images.');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function PhotoPicker({ value, onChange }: { value?: string; onChange(photo: string | undefined): void }) {
  const id = useId();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  return (
    <div className="field">
      <span className="label">Photo (optional)</span>
      <div className="photo-picker">
        {value ? <img src={value} alt="Current project photo" /> : <div className="photo-picker__empty"><ImageIcon size={28} /></div>}
        <div className="photo-picker__actions">
          <label htmlFor={id} className="btn btn--soft btn--sm file-btn">
            {busy ? 'Processing…' : value ? 'Change photo' : 'Add photo'}
          </label>
          <input
            id={id}
            className="visually-hidden"
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              setBusy(true);
              setError(undefined);
              try {
                onChange(await fileToPhoto(file));
              } catch (err) {
                setError(err instanceof Error ? err.message : 'That image could not be used.');
              } finally {
                setBusy(false);
              }
            }}
          />
          {value && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange(undefined)}>
              <TrashIcon size={16} /> Remove
            </button>
          )}
        </div>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}
