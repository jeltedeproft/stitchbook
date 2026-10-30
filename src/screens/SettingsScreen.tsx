import { useState } from 'react';
import { backupFileName, createBackup } from '../storage/backup';
import { href } from '../router';
import { useStore } from '../state/store';
import { useToast } from '../state/toast';
import { BackIcon, DownloadIcon, UploadIcon } from '../ui/icons';
import { ConfirmDialog } from '../ui/Sheet';

export function SettingsScreen() {
  const { projects, storageKind, importJson, removeSamples } = useStore();
  const toast = useToast();
  const [importError, setImportError] = useState<string>();
  const [confirmSamples, setConfirmSamples] = useState(false);
  const sampleCount = projects.filter((p) => p.isSample).length;

  const exportAll = () => {
    const blob = new Blob([JSON.stringify(createBackup(projects), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backupFileName();
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast({ message: `Exported ${projects.length} project${projects.length === 1 ? '' : 's'}.` });
  };

  return (
    <div className="page page--narrow">
      <a className="back-link" href={href.overview()}>
        <BackIcon size={18} /> All projects
      </a>
      <h1>Your data</h1>

      <section className="card prose">
        <h2>Where your projects are kept</h2>
        {storageKind === 'memory' ? (
          <p className="warn">
            This browser is blocking storage, so projects only last until this tab closes. Open the app in a normal
            (non-private) window to keep your work.
          </p>
        ) : (
          <p>
            Projects are saved automatically <strong>on this device, in this browser</strong>. Nothing is uploaded, and
            they're still here when you close and reopen the app.
          </p>
        )}
        <p>
          <strong>Sharing between the two of you:</strong> the app doesn't sync on its own yet. To share, export a backup
          and send the file to your friend; when they import it, new projects are added and, for projects you both have,
          the most recently changed version is kept. Exporting regularly is also a good backup.
        </p>
      </section>

      <section className="card">
        <h2>Backup &amp; share</h2>
        <div className="button-row">
          <button type="button" className="btn btn--primary" onClick={exportAll} disabled={projects.length === 0}>
            <DownloadIcon size={18} /> Export all projects
          </button>
          <label className="btn btn--soft file-btn" htmlFor="import-file">
            <UploadIcon size={18} /> Import a backup
          </label>
          <input
            id="import-file"
            className="visually-hidden"
            type="file"
            accept="application/json,.json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              setImportError(undefined);
              try {
                const r = await importJson(await file.text());
                toast({
                  message: `Imported: ${r.added} new, ${r.updated} updated${r.skipped ? `, ${r.skipped} skipped` : ''}.`,
                });
              } catch (err) {
                setImportError(err instanceof Error ? err.message : 'That file could not be imported.');
              }
            }}
          />
        </div>
        {importError && <p className="field-error" role="alert">{importError} Nothing was changed.</p>}
      </section>

      {sampleCount > 0 && (
        <section className="card">
          <h2>Sample projects</h2>
          <p className="muted">{sampleCount} sample project{sampleCount === 1 ? '' : 's'} are shown to help you explore.</p>
          <button type="button" className="btn btn--soft" onClick={() => setConfirmSamples(true)}>Remove samples</button>
        </section>
      )}

      {confirmSamples && (
        <ConfirmDialog
          title="Remove sample projects?"
          message="Sample projects will be deleted. Your own projects are not affected."
          confirmLabel="Remove samples"
          onCancel={() => setConfirmSamples(false)}
          onConfirm={async () => {
            setConfirmSamples(false);
            const n = await removeSamples();
            toast({ message: `Removed ${n} sample project${n === 1 ? '' : 's'}.` });
          }}
        />
      )}
    </div>
  );
}
