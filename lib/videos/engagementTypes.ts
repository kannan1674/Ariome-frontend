export type VideoComment = {
  id: string;
  videoId?: string;
  authorName: string;
  text: string;
  createdAt: string;
};

export type VideoEngagement = {
  likeCount: number;
  likedByMe: boolean;
  comments: VideoComment[];
};

export type TeacherFeedbackItem = {
  id: string;
  videoId: string;
  videoTitle: string;
  authorName: string;
  text: string;
  createdAt: string;
};

export type TeacherFeedback = {
  feedback: TeacherFeedbackItem[];
  totals: { comments: number; likes: number; watchTimeSeconds: number };
  perVideo: {
    videoId: string;
    title: string;
    likeCount: number;
    commentCount: number;
    watchTimeSeconds: number;
    viewCount: number;
  }[];
};
