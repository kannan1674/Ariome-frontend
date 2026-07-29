export type SessionMeta = {
  sessionExpiresAt: string;
  accessTokenExpiresAt: string;
  sessionExpiresInSeconds: number;
  accessTokenExpiresInSeconds: number;
  shouldRefreshBefore: string;
};

export type BackendAuthSuccess = {
  token: string;
  refreshToken: string;
  session: SessionMeta;
  user?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string | null;
    emailVerified?: boolean;
    role?: 'user' | 'teacher' | 'admin';
  };
};

export type LegacyLoginContent = {
  Token: string;
  ExpiresIn: number;
  RefreshToken: string;
  SessionId: string;
  Session?: SessionMeta;
  IsVerified: boolean;
  ProfileVerificationId: string | null;
  ClubRoleId: number;
  accountTypeId: number;
  AccountTypeId: number;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role?: 'user' | 'teacher' | 'admin';
};
