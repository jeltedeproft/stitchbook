import { useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { ImageIcon, TrashIcon } from './icons';

const MAX_SIDE = 1200;
const MAX_INPUT_BYTES = 25 * 1024 * 1024;

export type PhotoIssue = 'notImage' | 'tooLarge' | 'unreadable' | 'unsupported';

export class PhotoError extends Error {
  constructor(readonly code: PhotoIssue) {
    super(`Photo: ${code}`);
  }
}

/** Reads an image file and downscales it to a JPEG data URL so stored projects stay small. */
export async function fileToPhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new PhotoError('notImage');
  if (file.size > MAX_INPUT_BYTES) throw new PhotoError('tooLarge');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new PhotoError('unreadable'));
      el.src = url;
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new PhotoError('unsupported');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function PhotoPicker({ value, onChange }: { value?: string; onChange(photo: string | undefined): void }) {
  const input = useRef<HTMLInputElement>(null);
  const { t } = useI18n();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  return (
    <div className="field">
      <span className="label">{t('photo.label')}</span>
      <div className="photo-picker">
        {value ? <img src={value} alt={t('photo.current')} /> : <div className="photo-picker__empty"><ImageIcon size={28} /></div>}
        <div className="photo-picker__actions">
          <button type="button" className="btn btn--soft btn--sm" disabled={busy} onClick={() => input.current?.click()}>
            {busy ? t('photo.processing') : value ? t('photo.change') : t('photo.add')}
          </button>
          {/* Never shown: some phone browsers draw their own "Choose file" button for any visible file input. */}
          <input
            ref={input}
            hidden
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
                setError(t(`photo.${err instanceof PhotoError ? err.code : 'unreadable'}`));
              } finally {
                setBusy(false);
              }
            }}
          />
          {value && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange(undefined)}>
              <TrashIcon size={16} /> {t('common.remove')}
            </button>
          )}
        </div>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}
