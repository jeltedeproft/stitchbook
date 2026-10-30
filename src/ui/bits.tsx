import type { ReactNode } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { componentStatusLabel, craftLabel, statusLabel } from '../i18n/labels';
import type { ComponentStatus, Material, Project, ProjectStatus } from '../domain/types';
import { CraftIcon } from './icons';

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { t } = useI18n();
  return <span className={`badge badge--${status}`}>{statusLabel(t, status)}</span>;
}

export function ComponentStatusBadge({ status }: { status: ComponentStatus }) {
  const { t } = useI18n();
  return <span className={`badge badge--c-${status}`}>{componentStatusLabel(t, status)}</span>;
}

export function CraftTag({ project }: { project: Project }) {
  const { t } = useI18n();
  return (
    <span className="craft-tag">
      <CraftIcon craft={project.craft} size={16} />
      {craftLabel(t, project.craft)}
    </span>
  );
}

/** Photo if present, otherwise the project's swatch colour with a knitted texture. */
export function ProjectVisual({ project, className = '' }: { project: Project; className?: string }) {
  if (project.photo) {
    return <img className={`visual ${className}`} src={project.photo} alt="" />;
  }
  return (
    <div className={`visual visual--swatch ${className}`} style={{ backgroundColor: project.swatch }} aria-hidden="true">
      <CraftIcon craft={project.craft} size={36} strokeWidth={1.4} />
    </div>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  return (
    <div className="progress">
      <div
        className="progress__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress__pct">{pct}%</span>
    </div>
  );
}

export function Swatch({ color, label }: { color?: string; label?: string }) {
  return (
    <span
      className={`swatch ${color ? '' : 'swatch--empty'}`}
      style={color ? { backgroundColor: color } : undefined}
      title={label}
      aria-hidden="true"
    />
  );
}

export function materialColor(m: Material | undefined): string | undefined {
  return m?.colorHex;
}

export function EmptyState({
  title,
  children,
  action,
  art = 'yarn',
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  art?: 'yarn' | 'search' | 'parts';
}) {
  return (
    <div className="empty">
      <EmptyArt kind={art} />
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

function EmptyArt({ kind }: { kind: 'yarn' | 'search' | 'parts' }) {
  if (kind === 'search') {
    return (
      <svg className="empty__art" viewBox="0 0 120 90" aria-hidden="true">
        <circle cx="52" cy="42" r="24" fill="var(--c-surface-2)" stroke="var(--c-accent-2)" strokeWidth="4" />
        <path d="M70 60l18 18" stroke="var(--c-accent-2)" strokeWidth="6" strokeLinecap="round" />
        <path d="M40 40c6-6 18-6 24 0" stroke="var(--c-primary)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'parts') {
    return (
      <svg className="empty__art" viewBox="0 0 120 90" aria-hidden="true">
        <rect x="18" y="20" width="36" height="50" rx="8" fill="var(--c-surface-2)" stroke="var(--c-accent-2)" strokeWidth="3" />
        <rect x="62" y="14" width="18" height="40" rx="6" fill="var(--c-surface-2)" stroke="var(--c-primary)" strokeWidth="3" />
        <rect x="86" y="14" width="18" height="40" rx="6" fill="var(--c-surface-2)" stroke="var(--c-primary)" strokeWidth="3" strokeDasharray="5 4" />
        <path d="M24 32h24M24 42h24M24 52h24" stroke="var(--c-accent-2)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className="empty__art" viewBox="0 0 120 90" aria-hidden="true">
      <circle cx="50" cy="50" r="30" fill="var(--c-surface-2)" stroke="var(--c-primary)" strokeWidth="3" />
      <path d="M24 40c16 8 36 8 52 0M22 54c18 10 38 10 56 0M38 22c-6 18-6 40 2 58M58 21c8 18 8 40-2 58" stroke="var(--c-primary)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M80 50c12 0 14 12 26 12" stroke="var(--c-accent-2)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M88 12l14 40M104 12l-12 34" stroke="var(--c-accent-3)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
