import type { SVGProps } from 'react';
import type { Craft } from '../domain/types';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const PlusIcon = (p: IconProps) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const MinusIcon = (p: IconProps) => <Svg {...p}><path d="M5 12h14" /></Svg>;
export const BackIcon = (p: IconProps) => <Svg {...p}><path d="M15 18l-6-6 6-6" /></Svg>;
export const EditIcon = (p: IconProps) => <Svg {...p}><path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></Svg>;
export const UpIcon = (p: IconProps) => <Svg {...p}><path d="M6 15l6-6 6 6" /></Svg>;
export const DownIcon = (p: IconProps) => <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>;
export const TrashIcon = (p: IconProps) => <Svg {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Svg>;
export const ArchiveIcon = (p: IconProps) => <Svg {...p}><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v10h14V9M10 13h4" /></Svg>;
export const SettingsIcon = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></Svg>;
export const CheckIcon = (p: IconProps) => <Svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>;
export const CloseIcon = (p: IconProps) => <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>;
export const ResetIcon = (p: IconProps) => <Svg {...p}><path d="M4 4v6h6" /><path d="M5.5 15a7 7 0 101.4-7.4L4 10" /></Svg>;
export const DownloadIcon = (p: IconProps) => <Svg {...p}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></Svg>;
export const UploadIcon = (p: IconProps) => <Svg {...p}><path d="M12 20V9M7 14l5-5 5 5M5 4h14" /></Svg>;
export const ImageIcon = (p: IconProps) => <Svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 17l-5-5-9 8" /></Svg>;
export const NoteIcon = (p: IconProps) => <Svg {...p}><path d="M5 4h14v12l-4 4H5z" /><path d="M15 20v-4h4M8 9h8M8 13h5" /></Svg>;

export const KnittingIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10" cy="14" r="6" />
    <path d="M5.5 11c3 1.5 6 1.5 9 0M4.5 15c3.5 2 7.5 2 11 0M8 8.5c1 3 1 8 0 11.5" />
    <path d="M14 3l7 14M20 3l-6 10" />
  </Svg>
);
export const CrochetIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 20L17.5 6.5" />
    <path d="M17.5 6.5a2 2 0 103-2.6c-.6.3-1 .9-.9 1.6" />
    <circle cx="8" cy="9" r="4" />
    <path d="M5 7.5c2 .8 4 .8 6 0" />
  </Svg>
);
export const SewingIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="6" cy="18" r="2.5" />
    <path d="M8 7.5L20 16M8 16.5L20 8" />
  </Svg>
);
export const OtherCraftIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l2.2 5.3L20 9l-4.4 3.8L17 19l-5-3-5 3 1.4-6.2L4 9l5.8-.7z" />
  </Svg>
);

export function CraftIcon({ craft, ...p }: IconProps & { craft: Craft }) {
  switch (craft) {
    case 'knitting':
      return <KnittingIcon {...p} />;
    case 'crochet':
      return <CrochetIcon {...p} />;
    case 'sewing':
      return <SewingIcon {...p} />;
    default:
      return <OtherCraftIcon {...p} />;
  }
}
