export type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string | null;
  phone: string;
  role: 'user' | 'teacher' | 'admin';
  emailVerified: boolean;
  createdAt: string;
};

/** @deprecated Use AdminUser */
export type AdminTeacher = AdminUser;

export type AdminDashboardStats = {
  totalUsers: number;
  totalTeachers: number;
  totalVideos: number;
  totalViews: number;
  totalWatchTimeSeconds: number;
};

export type AdminDashboardVideo = {
  id: string;
  title: string;
  teacherName: string;
  viewCount: number;
  watchTimeSeconds: number;
  thumbnailUrl: string | null;
  createdAt: string;
};

export type AdminDashboard = {
  stats: AdminDashboardStats;
  videos: AdminDashboardVideo[];
};
