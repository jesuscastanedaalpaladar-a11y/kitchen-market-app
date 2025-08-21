
import React from 'react';

const iconProps = {
  className: "h-6 w-6 inline-block",
};

export const RecipeIcon: React.FC = () => (
  <svg {...iconProps} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);
export const ProductionIcon: React.FC = () => (
  <svg {...iconProps} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="M20 12h2"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M12 20v2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="M4 12H2"></path><path d="m6.34 6.34-1.41-1.41"></path><circle cx="12" cy="12" r="4"></circle>
  </svg>
);
export const ChecklistIcon: React.FC = () => (
  <svg {...iconProps} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="m9 14 2 2 4-4"></path>
  </svg>
);
export const BatchIcon: React.FC = () => (
  <svg {...iconProps} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15c0-1.1.9-2 2-2V7c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v6c1.1 0 2 .9 2 2"></path><path d="M21 7v10"></path><path d="M3 7v10"></path><path d="M21 17H3"></path><path d="M12 11v-1"></path>
  </svg>
);
export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`h-6 w-6 inline-block ${className || ''}`} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);
export const ReportIcon: React.FC = () => (
  <svg {...iconProps} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3v18h18"></path><path d="M18.7 8a6 6 0 0 0-8.1 1.4l-4.1 4.1"></path><path d="M12 18H7.5"></path><path d="m12 12.5 5.7 5.7"></path>
  </svg>
);
export const LogoutIcon: React.FC = () => (
  <svg {...iconProps} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line>
  </svg>
);
export const TimerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`h-5 w-5 inline-block ${className || ''}`} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);
export const YieldIcon: React.FC = () => (
    <svg {...iconProps} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="m5 8 6 6"></path><path d="m4 14 6-6 2-3"></path><path d="M12 22v-5"></path><path d="M12 17h5"></path><path d="m17 17-5-5"></path>
    </svg>
);
export const ServiceIcon: React.FC = () => (
  <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 15h18v-2H3v2Zm0 4h18v-2H3v2Zm0-8h18V9H3v2Zm0-6v2h18V5H3Z"/>
  </svg>
);
export const PlayIcon: React.FC = () => (
  <svg {...iconProps} className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5.14v14l11-7-11-7Z"/>
  </svg>
);
export const CalculatorIcon: React.FC = () => (
    <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
        <line x1="8" y1="6" x2="16" y2="6"></line>
        <line x1="12" y1="10" x2="12" y2="18"></line>
        <line x1="8" y1="14" x2="16" y2="14"></line>
    </svg>
);
export const CalendarIcon: React.FC = () => (
    <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);
export const AlarmClockIcon: React.FC = () => (
    <svg {...iconProps} className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="13" r="8"></circle>
        <path d="M12 9v4l2 2"></path>
        <path d="M5 3 2 6"></path>
        <path d="m22 6-3-3"></path>
        <path d="M6.38 18.7 4 21"></path>
        <path d="M17.64 18.67 20 21"></path>
    </svg>
);
export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`h-5 w-5 inline-block ${className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);
export const PlusIcon: React.FC = () => (
    <svg {...iconProps} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`h-5 w-5 inline-block ${className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l2.35 4.65L19 7.5l-3.5 3.4L16.7 16 12 13.8 7.3 16l1.2-5.1L5 7.5l4.65-.85L12 2zM21 11l-1.9-3.8-3.8-1.9 3.8-1.9 1.9 3.8 1.9 3.8-3.8 1.9zM4 19l-1.9-3.8-3.8-1.9 3.8-1.9 1.9 3.8 1.9 3.8-3.8 1.9z" />
  </svg>
);

export const EditIcon: React.FC = () => (
  <svg {...iconProps} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const WasteIcon: React.FC = () => (
  <svg {...iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.7 6.3c.4.4.4 1 0 1.4L15.4 10l2.3 2.3c.4.4.4 1 0 1.4-.4.4-1 .4-1.4 0L14 11.4l-2.3 2.3c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4L12.6 10l-2.3-2.3c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0L14 8.6l2.3-2.3c.4-.4 1-.4 1.4 0zM21 12c0-4.4-3.6-8-8-8h-1a8 8 0 0 0-8 8c0 1.6.5 3.1 1.3 4.4L4 20l4.4-1.3C9.9 19.5 11.4 20 13 20c4.4 0 8-3.6 8-8z"/>
  </svg>
);

export const BoardIcon: React.FC = () => (
    <svg {...iconProps} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="12" y1="3" x2="12" y2="21"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
    </svg>
);

export const ListIcon: React.FC = () => (
    <svg {...iconProps} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
);

export const GripVerticalIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...iconProps} className={className || iconProps.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="12" r="1"></circle>
        <circle cx="9" cy="5" r="1"></circle>
        <circle cx="9" cy="19" r="1"></circle>
        <circle cx="15" cy="12" r="1"></circle>
        <circle cx="15" cy="5" r="1"></circle>
        <circle cx="15" cy="19" r="1"></circle>
    </svg>
);

export const VideoIcon: React.FC = () => (
    <svg {...iconProps} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="m22 8-6 4 6 4V8Z"></path>
        <rect x="2" y="6" width="14" height="12" rx="2" ry="2"></rect>
    </svg>
);

export const UploadIcon: React.FC = () => (
    <svg {...iconProps} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);

export const CameraIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={`h-full w-full text-gray-300 dark:text-gray-500 ${className || ''}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

export const XIcon: React.FC = () => (
    <svg {...iconProps} className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export const IngredientIcon: React.FC = () => (
    <svg {...iconProps} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 14.5c-3.22-2.7-3.22-7.3 0-10 .27-.23.56-.44.88-.62 .6-.33 1.25-.5 1.93-.52A7.12 7.12 0 0 1 18 8.88c0 1.27-.33 2.5-1 3.62-1.72 2.7-4.28 4-7 4Z"></path>
        <path d="M12 15c-1.2 0-2.3.2-3.4.6-.8.3-1.6.7-2.3 1.3-1.4 1-2.3 2.5-2.3 4.1 0 .6.4 1 1 1h16c.6 0 1-.4 1-1 0-1.6-1-3.1-2.3-4.1-.8-.6-1.5-1-2.3-1.3A11.7 11.7 0 0 0 12 15Z"></path>
    </svg>
);

export const SaveIcon: React.FC = () => (
  <svg {...iconProps} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

export const TagIcon: React.FC = () => (
    <svg {...iconProps} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
        <path d="M7 7h.01"></path>
    </svg>
);

export const SunIcon: React.FC = () => (
    <svg {...iconProps} className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
    </svg>
);

export const MoonIcon: React.FC = () => (
    <svg {...iconProps} className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
    </svg>
);