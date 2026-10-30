import { useId, useRef, useState, type FormEvent } from 'react';
import { MAX_COUNT, parseCount } from '../domain/validation';
import { formatNumber, useI18n } from '../i18n/I18nProvider';
import { MinusIcon, PlusIcon, ResetIcon } from './icons';

interface CounterProps {
  label: string;
  value: number;
  target?: number;
  onChange(delta: number): void;
  onSet(value: number): void;
  onReset(): void;
}

function tick() {
  try {
    navigator.vibrate?.(8);
  } catch {
    // Haptics are a nicety; ignore browsers that refuse.
  }
}

/** A tally counter: large − / + buttons, the number itself opens direct entry. */
export function Counter({ label, value, target, onChange, onSet, onReset }: CounterProps) {
  const { t, lang } = useI18n();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string>();
  const inputId = useId();
  const valueButton = useRef<HTMLButtonElement>(null);
  const names = { label, lower: label.toLowerCase() };

  const startEdit = () => {
    setDraft(String(value));
    setError(undefined);
    setEditing(true);
  };

  const finishEdit = () => {
    setEditing(false);
    setError(undefined);
    requestAnimationFrame(() => valueButton.current?.focus());
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseCount(draft);
    if ('error' in parsed) {
      setError(
        parsed.error === 'tooBig'
          ? t('counter.tooBig', { max: formatNumber(lang, MAX_COUNT) })
          : t('counter.notWhole'),
      );
      return;
    }
    onSet(parsed.value);
    finishEdit();
  };

  return (
    <div className="counter" role="group" aria-label={label}>
      <div className="counter__head">
        <span className="counter__label">{label}</span>
        {value > 0 && (
          <button type="button" className="link-btn counter__reset" onClick={onReset} aria-label={t('counter.resetLabel', names)}>
            <ResetIcon size={14} /> {t('counter.reset')}
          </button>
        )}
      </div>
      <div className="counter__row">
        <button
          type="button"
          className="counter__btn"
          aria-label={t('counter.decrease', names)}
          disabled={value <= 0}
          onClick={() => {
            tick();
            onChange(-1);
          }}
        >
          <MinusIcon size={24} />
        </button>

        {editing ? (
          <form className="counter__edit" onSubmit={submit} noValidate>
            <label className="visually-hidden" htmlFor={inputId}>
              {t('counter.set', names)}
            </label>
            <input
              id={inputId}
              className="counter__input"
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
              value={draft}
              aria-invalid={!!error}
              aria-describedby={error ? `${inputId}-err` : undefined}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') finishEdit();
              }}
              onBlur={(e) => {
                // Clicking "Set" counts as submitting, not cancelling.
                if (!e.currentTarget.form?.contains(e.relatedTarget as Node)) finishEdit();
              }}
            />
            <button type="submit" className="counter__set">
              {t('counter.setButton')}
            </button>
          </form>
        ) : (
          <button
            ref={valueButton}
            type="button"
            className="counter__value"
            onClick={startEdit}
            aria-label={
              target
                ? t('counter.valueTarget', { label, value, target })
                : t('counter.value', { label, value })
            }
          >
            <span className="counter__num">{value}</span>
            {target ? <small> / {target}</small> : null}
          </button>
        )}
        <span className="visually-hidden" aria-live="polite" aria-atomic="true">
          {`${label} ${value}`}
        </span>

        <button
          type="button"
          className="counter__btn counter__btn--up"
          aria-label={t('counter.increase', names)}
          disabled={value >= MAX_COUNT}
          onClick={() => {
            tick();
            onChange(1);
          }}
        >
          <PlusIcon size={24} />
        </button>
      </div>
      {error && (
        <p className="field-error" id={`${inputId}-err`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
