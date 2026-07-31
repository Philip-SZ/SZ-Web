export type UserRole = 'admin' | 'user';

export type UserStatus = 'approved' | 'pending';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  avatarUrl?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number; // in bytes
  type: string; // e.g. 'application/pdf', 'text/plain', 'image/png', 'application/zip'
  contentUrl: string; // Data URL or Blob URL for downloading
  downloadCount: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: string;
  attachments: FileAttachment[];
  tags?: string[];
}

export interface AuthState {
  currentUser: User | null;
}
