import { useRef, useState } from 'react';
import { BackupFormatError, backupFileName, createBackup } from '../storage/backup';
import { useI18n } from '../i18n/I18nProvider';
import { LANGS, SIZE_SYSTEMS } from '../i18n/lang';
import { href } from '../router';
import { useStore } from '../state/store';
import { useToast } from '../state/toast';
import { BackIcon, DownloadIcon, UploadIcon } from '../ui/icons';
import { ConfirmDialog } from '../ui/Sheet';

const LANG_NAMES = { en: 'English', fr: 'Français' } as const;

export function SettingsScreen() {
  const { projects, storageKind, importJson, removeSamples } = useStore();
  const toast = useToast();
  const { t, tp, lang, setLang, sizes, setSizes } = useI18n();
  const importInput = useRef<HTMLInputElement>(null);
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
    toast({ message: tp('settings.exported', projects.length) });
  };

  return (
    <div className="page page--narrow">
      <a className="back-link" href={href.overview()}>
        <BackIcon size={18} /> {t('common.allProjects')}
      </a>
      <h1>{t('settings.title')}</h1>

      <section className="card">
        <h2 id="language-heading">{t('settings.languageTitle')}</h2>
        <div className="segmented" role="radiogroup" aria-labelledby="language-heading">
          {LANGS.map((l) => (
            <label key={l} className={lang === l ? 'is-on' : ''} lang={l}>
              <input type="radio" name="language" value={l} checked={lang === l} onChange={() => setLang(l)} />
              {LANG_NAMES[l]}
            </label>
          ))}
        </div>
        {sampleCount > 0 && <p className="hint">{t('settings.languageHint')}</p>}
      </section>

      <section className="card">
        <h2 id="sizes-heading">{t('settings.sizesTitle')}</h2>
        <div className="segmented" role="radiogroup" aria-labelledby="sizes-heading">
          {SIZE_SYSTEMS.map((s) => (
            <label key={s} className={sizes === s ? 'is-on' : ''}>
              <input type="radio" name="sizes" value={s} checked={sizes === s} onChange={() => setSizes(s)} />
              {t(s === 'metric' ? 'settings.sizesMetric' : 'settings.sizesUs')}
            </label>
          ))}
        </div>
      </section>

      <section className="card prose">
        <h2>{t('settings.whereTitle')}</h2>
        {storageKind === 'memory' ? (
          <p className="warn">{t('settings.memoryWarning')}</p>
        ) : (
          <p>
            {t('settings.deviceBefore')}
            <strong>{t('settings.deviceStrong')}</strong>
            {t('settings.deviceAfter')}
          </p>
        )}
        <p>
          <strong>{t('settings.shareStrong')}</strong>
          {t('settings.shareBody')}
        </p>
      </section>

      <section className="card">
        <h2>{t('settings.backupTitle')}</h2>
        <div className="button-row">
          <button type="button" className="btn btn--primary" onClick={exportAll} disabled={projects.length === 0}>
            <DownloadIcon size={18} /> {t('settings.export')}
          </button>
          <button type="button" className="btn btn--soft" onClick={() => importInput.current?.click()}>
            <UploadIcon size={18} /> {t('settings.import')}
          </button>
          <input
            ref={importInput}
            hidden
            type="file"
            accept="application/json,.json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              setImportError(undefined);
              try {
                const r = await importJson(await file.text());
                toast({ message: t(r.skipped ? 'settings.importedSkipped' : 'settings.imported', { added: r.added, updated: r.updated, skipped: r.skipped }) });
              } catch (err) {
                setImportError(t(err instanceof BackupFormatError ? `settings.${err.code}` : 'settings.importFailed'));
              }
            }}
          />
        </div>
        {importError && <p className="field-error" role="alert">{importError} {t('settings.nothingChanged')}</p>}
      </section>

      {sampleCount > 0 && (
        <section className="card">
          <h2>{t('settings.samplesTitle')}</h2>
          <p className="muted">{tp('settings.samplesBody', sampleCount)}</p>
          <button type="button" className="btn btn--soft" onClick={() => setConfirmSamples(true)}>{t('samples.remove')}</button>
        </section>
      )}

      {confirmSamples && (
        <ConfirmDialog
          title={t('samples.confirmTitle')}
          message={t('settings.samplesConfirmBody')}
          confirmLabel={t('samples.remove')}
          onCancel={() => setConfirmSamples(false)}
          onConfirm={async () => {
            setConfirmSamples(false);
            const n = await removeSamples();
            toast({ message: tp('samples.removed', n) });
          }}
        />
      )}
    </div>
  );
}
