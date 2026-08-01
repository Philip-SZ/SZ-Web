export type UserRole = 'admin' | 'user';

export type UserStatus = 'approved' | 'pending';

export type UserRank = 'not_granted' | 'normal' | 'creator' | 'developer' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  avatarUrl?: string;
  isVerified?: boolean;
  rank?: UserRank;
  bio?: string;
  friends?: string[]; // Array of friend user IDs
  friendRequestsSent?: string[]; // Array of target user IDs
  friendRequestsReceived?: string[]; // Array of requester user IDs
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
  isCreatorPost?: boolean;
  isCreatorTabPost?: boolean;
  rating?: number; // 1 to 5 rating by creator
  status?: 'pending' | 'approved';
  likes?: string[]; // user IDs who liked the post
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRank?: UserRank;
  authorIsVerified?: boolean;
  content: string;
  createdAt: string;
}

export interface AuthState {
  currentUser: User | null;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'badge';
  createdAt: string;
  read: boolean;
}

export interface AppEvent {
  id: string;
  title: string;
  description: string;
  category: 'added' | 'removed' | 'updated' | 'announcement';
  date: string;
  version?: string;
}
