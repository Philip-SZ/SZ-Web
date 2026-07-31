import { User, Post, FileAttachment } from './types';

const USERS_KEY = 'phillip_dev_portal_users';
const POSTS_KEY = 'phillip_dev_portal_posts';
const BOOKMARKS_KEY = 'phillip_dev_portal_bookmarks';
const CURRENT_USER_KEY = 'phillip_dev_portal_current_user';
const SETTINGS_KEY = 'phillip_dev_portal_settings';

export interface AppSettings {
  theme: 'dark' | 'light';
  fontSize: 'normal' | 'large';
  compactView: boolean;
  language: 'de' | 'en';
  autoDownload: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  fontSize: 'normal',
  compactView: false,
  language: 'de',
  autoDownload: true,
};

export function getSettings(): AppSettings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

export function resetAllData(): void {
  localStorage.clear();
  initializeStorage();
}

// Helper to encode a string into a downloadable text/data URL
export function createDataUrl(content: string, mimeType: string = 'text/plain'): string {
  const blob = new Blob([content], { type: mimeType });
  return URL.createObjectURL(blob);
}

// Initial seed data for Phillip Dev and sample posts
const SEED_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'usr_phillip_dev',
    username: 'Phillip Dev',
    email: 'phillip@dev.io',
    role: 'admin',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    passwordHash: 'Ingolstadt 2015',
  },
  {
    id: 'usr_alex_approved',
    username: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'user',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    passwordHash: 'password123',
  },
  {
    id: 'usr_sarah_pending',
    username: 'Sarah Miller',
    email: 'sarah@example.com',
    role: 'user',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    passwordHash: 'password123',
  }
];

// Helper sample attachment text generator
const sampleCodeSnippet = `// Phillip Dev - High Performance Microservices Setup
import express from 'express';

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', version: '2.4.0', timestamp: new Date() });
});

export default app;`;

const sampleDocText = `=====================================================
PHILLIP DEV PORTAL - SYSTEM ARCHITECTURE & RELEASE SPECS
=====================================================

1. Overview
   This portal serves as the primary distribution node for verified software builds,
   architectural specifications, and exclusive developer updates.

2. Access Control Policy
   - Administrative Account: Phillip Dev
   - User Registration: Default state is PENDING RELEASE.
   - Reading, File Downloading, and Bookmarking require explicit release by Phillip Dev.

3. File Distribution & Integrity
   - All downloadable assets are hashed and sanitized prior to publishing.
   - Members are requested to store sensitive credentials securely.

Regards,
Phillip Dev
`;

const sampleConfigJson = JSON.stringify({
  appName: "Phillip Dev Portal",
  version: "2.4.0",
  environment: "production",
  securityMode: "strict_release_approval",
  adminContact: "phillip@dev.io"
}, null, 2);

const SEED_POSTS: Post[] = [
  {
    id: 'post_1',
    authorId: 'usr_phillip_dev',
    authorName: 'Phillip Dev',
    title: 'Welcome & System Architecture Release v2.4',
    content: 'Welcome to the official developer portal. Here I will regularly publish exclusive software builds, code templates, and design specifications. Please note that newly registered accounts must be verified and released before full access to downloads and bookmarks is granted.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    tags: ['Architecture', 'Announcement'],
    attachments: [
      {
        id: 'att_1',
        name: 'Architecture_Spec_v2.4.txt',
        size: sampleDocText.length,
        type: 'text/plain',
        contentUrl: createDataUrl(sampleDocText, 'text/plain'),
        downloadCount: 14,
      },
      {
        id: 'att_2',
        name: 'system_config.json',
        size: sampleConfigJson.length,
        type: 'application/json',
        contentUrl: createDataUrl(sampleConfigJson, 'application/json'),
        downloadCount: 9,
      }
    ],
  },
  {
    id: 'post_2',
    authorId: 'usr_phillip_dev',
    authorName: 'Phillip Dev',
    title: 'Express Microservice Starter Boilerplate',
    content: 'Attached is the clean Express TypeScript microservice boilerplate discussed in my latest dev log. It includes built-in health routes, request validation middleware, and Docker configuration files ready for deployment.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    tags: ['Source Code', 'Express', 'TypeScript'],
    attachments: [
      {
        id: 'att_3',
        name: 'microservice_starter.ts',
        size: sampleCodeSnippet.length,
        type: 'text/typescript',
        contentUrl: createDataUrl(sampleCodeSnippet, 'text/typescript'),
        downloadCount: 28,
      }
    ],
  },
];

// Initialize LocalStorage if not present
export function initializeStorage(): void {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
  } else {
    // Ensure Phillip Dev password in local storage is updated to 'Ingolstadt 2015'
    try {
      const users: (User & { passwordHash: string })[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      let updated = false;
      users.forEach(u => {
        if (u.username.toLowerCase().replace(/\s+/g, '') === 'phillipdev') {
          u.passwordHash = 'Ingolstadt 2015';
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
    } catch {}
  }
  if (!localStorage.getItem(POSTS_KEY)) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(SEED_POSTS));
  }
  if (!localStorage.getItem(BOOKMARKS_KEY)) {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(['post_1']));
  }
  if (!localStorage.getItem(CURRENT_USER_KEY)) {
    // Default to Phillip Dev for convenience or logged out
    const users = getUsersWithPasswords();
    const phillip = users.find(u => u.username.toLowerCase().replace(/\s+/g, '') === 'phillipdev');
    if (phillip) {
      const { passwordHash, ...safeUser } = phillip;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    }
  }
}

// User Helpers
export function getUsersWithPasswords(): (User & { passwordHash: string })[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return SEED_USERS;
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_USERS;
  }
}

export function getUsers(): User[] {
  return getUsersWithPasswords().map(({ passwordHash, ...user }) => user);
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  try {
    const safeUser: User = JSON.parse(raw);
    // Refresh user status from main storage
    const allUsers = getUsers();
    const updated = allUsers.find(u => u.id === safeUser.id);
    return updated || safeUser;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

// Register a new user (always pending release)
export function registerUser(username: string, email: string, password: string): { success: boolean; user?: User; error?: string } {
  const users = getUsersWithPasswords();
  const trimmedName = username.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (users.some(u => u.username.toLowerCase() === trimmedName.toLowerCase())) {
    return { success: false, error: 'A user with this username already exists.' };
  }

  // Check if registering as Phillip Dev
  const isPhillipDev = trimmedName.toLowerCase().replace(/\s+/g, '') === 'phillipdev';

  const newUser: User & { passwordHash: string } = {
    id: `usr_${Date.now()}`,
    username: trimmedName,
    email: trimmedEmail,
    role: isPhillipDev ? 'admin' : 'user',
    status: isPhillipDev ? 'approved' : 'pending', // Only Phillip Dev is auto-approved, regular users are PENDING
    createdAt: new Date().toISOString(),
    passwordHash: password,
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const { passwordHash, ...safeUser } = newUser;
  setCurrentUser(safeUser);
  return { success: true, user: safeUser };
}

// Login user
export function loginUser(usernameOrEmail: string, password: string): { success: boolean; user?: User; error?: string } {
  const users = getUsersWithPasswords();
  const query = usernameOrEmail.trim().toLowerCase();

  const found = users.find(
    u => u.username.toLowerCase() === query || u.email.toLowerCase() === query || u.username.toLowerCase().replace(/\s+/g, '') === query.replace(/\s+/g, '')
  );

  if (!found) {
    return { success: false, error: 'User account not found.' };
  }

  const isPhillipDev = found.username.toLowerCase().replace(/\s+/g, '') === 'phillipdev';
  const isPasswordCorrect = found.passwordHash === password || 
    (isPhillipDev && (password === 'Ingolstadt 2015' || password === 'Ingolstadt2015'));

  if (!isPasswordCorrect) {
    return { success: false, error: 'Invalid password.' };
  }

  const { passwordHash, ...safeUser } = found;
  setCurrentUser(safeUser);
  return { success: true, user: safeUser };
}

// Release / Approve a pending user (Phillip Dev action)
export function releaseUser(userId: string): boolean {
  const users = getUsersWithPasswords();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return false;

  users[index].status = 'approved';
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
}

// Reject / Revoke a user (Phillip Dev action)
export function removeUser(userId: string): boolean {
  let users = getUsersWithPasswords();
  users = users.filter(u => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
}

// Post Management
export function getPosts(): Post[] {
  const raw = localStorage.getItem(POSTS_KEY);
  if (!raw) return SEED_POSTS;
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_POSTS;
  }
}

export function createPost(title: string, content: string, attachments: FileAttachment[], tags: string[]): Post {
  const posts = getPosts();
  const newPost: Post = {
    id: `post_${Date.now()}`,
    authorId: 'usr_phillip_dev',
    authorName: 'Phillip Dev',
    title: title.trim(),
    content: content.trim(),
    createdAt: new Date().toISOString(),
    tags: tags.length ? tags : ['Update'],
    attachments,
  };

  posts.unshift(newPost);
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  return newPost;
}

// Increment download count
export function recordDownload(postId: string, attachmentId: string): void {
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    const att = post.attachments.find(a => a.id === attachmentId);
    if (att) {
      att.downloadCount = (att.downloadCount || 0) + 1;
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    }
  }
}

// Bookmarks Management
export function getBookmarks(userId: string): string[] {
  const raw = localStorage.getItem(`${BOOKMARKS_KEY}_${userId}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function toggleBookmark(userId: string, postId: string): string[] {
  const current = getBookmarks(userId);
  let updated: string[];
  if (current.includes(postId)) {
    updated = current.filter(id => id !== postId);
  } else {
    updated = [...current, postId];
  }
  localStorage.setItem(`${BOOKMARKS_KEY}_${userId}`, JSON.stringify(updated));
  return updated;
}
