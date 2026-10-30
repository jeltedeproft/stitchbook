import type { Craft, ComponentStatus, ProjectStatus } from './types';

export const CRAFTS: Craft[] = ['knitting', 'crochet', 'sewing', 'other'];
export const PROJECT_STATUSES: ProjectStatus[] = ['planned', 'in_progress', 'paused', 'completed'];
export const COMPONENT_STATUSES: ComponentStatus[] = ['not_started', 'in_progress', 'complete'];

/** Whether row/stitch counters make sense by default for a craft. */
export function countersByDefault(craft: Craft): boolean {
  return craft !== 'sewing';
}

/** Warm swatches used as a project's visual identifier when it has no photo. */
export const SWATCHES = [
  '#c2643c', '#8a9a5b', '#b5838d', '#d4a35a', '#5c7c8a', '#7d5a7a', '#a0522d', '#6b8f71',
];
