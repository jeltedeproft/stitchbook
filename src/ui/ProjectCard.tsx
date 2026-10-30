import { partCounts, projectProgress } from '../domain/progress';
import type { Project } from '../domain/types';
import { useI18n, type I18n } from '../i18n/I18nProvider';
import { href } from '../router';
import { CraftTag, ProgressBar, ProjectVisual, StatusBadge } from './bits';

export function progressSummary({ t, tp, lang }: Pick<I18n, 't' | 'tp' | 'lang'>, project: Project): string {
  const { done, total } = partCounts(project);
  if (total === 0) return project.status === 'completed' ? t('progress.finished') : t('progress.noParts');
  // English agrees with the total ("1 of 4 parts done"); French with the number done
  // ("1 partie terminée sur 4", "2 parties terminées sur 4").
  return tp('progress.parts', lang === 'fr' ? done : total, { done, count: total });
}

export function ProjectCard({ project }: { project: Project }) {
  const i18n = useI18n();
  const { t } = i18n;
  const progress = projectProgress(project);
  return (
    <li className="pcard">
      <a className="pcard__link" href={href.project(project.id)}>
        <ProjectVisual project={project} className="pcard__visual" />
        <div className="pcard__body">
          <div className="pcard__tags">
            <CraftTag project={project} />
            {project.isSample && <span className="badge badge--sample">{t('common.sample')}</span>}
            {project.archived && <span className="badge badge--archived">{t('common.archived')}</span>}
          </div>
          <h3 className="pcard__title">{project.name}</h3>
          <div className="pcard__status">
            <StatusBadge status={project.status} />
            <span className="muted">{progressSummary(i18n, project)}</span>
          </div>
          <ProgressBar value={progress} label={t('progress.label', { name: project.name })} />
        </div>
      </a>
    </li>
  );
}
