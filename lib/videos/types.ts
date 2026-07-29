export type VideoSubtitleTrack = {
  language: string;
  label: string;
  url: string;
  default?: boolean;
};

export type TeacherVideo = {
  id: string;
  title: string;
  description: string;
  mood: string;
  section: 'wisdom' | 'practices';
  videoUrl: string;
  hlsUrl?: string | null;
  playbackUrl?: string;
  subtitleTracks?: VideoSubtitleTrack[];
  transcodeStatus?: 'pending' | 'processing' | 'ready' | 'failed' | 'skipped';
  transcribeStatus?: 'pending' | 'processing' | 'ready' | 'failed' | 'skipped';
  transcribeError?: string;
  thumbnailUrl?: string | null;
  mimeType: string;
  size?: number;
  durationSeconds?: number;
  teacherName: string;
  viewCount?: number;
  watchTimeSeconds?: number;
  likeCount?: number;
  createdAt: string;
  source: 'upload';
  localized?: boolean;
  sourceLocale?: string;
  displayLocale?: string;
  translationProvider?: string;
};
