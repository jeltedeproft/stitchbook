import { projectProgress, progressSummary } from '../domain/progress';
import type { Project } from '../domain/types';
import { href } from '../router';
import { CraftTag, ProgressBar, ProjectVisual, StatusBadge } from './bits';

export function ProjectCard({ project }: { project: Project }) {
  const progress = projectProgress(project);
  return (
    <li className="pcard">
      <a className="pcard__link" href={href.project(project.id)}>
        <ProjectVisual project={project} className="pcard__visual" />
        <div className="pcard__body">
          <div className="pcard__tags">
            <CraftTag project={project} />
            {project.isSample && <span className="badge badge--sample">Sample</span>}
            {project.archived && <span className="badge badge--archived">Archived</span>}
          </div>
          <h3 className="pcard__title">{project.name}</h3>
          <div className="pcard__status">
            <StatusBadge status={project.status} />
            <span className="muted">{progressSummary(project)}</span>
          </div>
          <ProgressBar value={progress} label={`${project.name} progress`} />
        </div>
      </a>
    </li>
  );
}
