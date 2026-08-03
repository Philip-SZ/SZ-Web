import { User, UserRank, Post, FileAttachment, UserNotification, AppEvent, Comment, CreatorApplication, SupporterApplication } from './types';

const USERS_KEY = 'phillip_dev_portal_users';
const POSTS_KEY = 'phillip_dev_portal_posts';
const BOOKMARKS_KEY = 'phillip_dev_portal_bookmarks';
const CURRENT_USER_KEY = 'phillip_dev_portal_current_user';
const SETTINGS_KEY = 'phillip_dev_portal_settings';
const NOTIFICATIONS_KEY = 'phillip_dev_portal_notifications';
const APP_EVENTS_KEY = 'phillip_dev_portal_app_events';
const COMMENTS_KEY = 'phillip_dev_portal_comments';

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

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
}

function safeClear(): void {
  try {
    localStorage.clear();
  } catch {}
}

export function getSettings(): AppSettings {
  const raw = safeGetItem(SETTINGS_KEY);
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
  safeSetItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

export function resetAllData(): void {
  safeClear();
  initializeStorage();
}

// Helper to encode a string into a portable data URL
export function createDataUrl(content: string, mimeType: string = 'text/plain'): string {
  return `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
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
    isVerified: true,
    rank: 'admin',
    bio: 'Founder & Admin of Phillip Dev Portal. Building high-performance microservices and software tools.',
    friends: ['usr_alex_approved'],
  },
  {
    id: 'usr_alex_approved',
    username: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'user',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    passwordHash: 'password123',
    isVerified: true,
    rank: 'developer',
    bio: 'Fullstack JavaScript & TypeScript developer. Enthusiastic community contributor.',
    friends: ['usr_phillip_dev'],
  },
  {
    id: 'usr_sarah_pending',
    username: 'Sarah Miller',
    email: 'sarah@example.com',
    role: 'user',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    passwordHash: 'password123',
    isVerified: false,
    rank: 'not_granted',
    bio: 'Awaiting account approval.',
    friends: [],
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
  {
    id: 'post_creator_1',
    authorId: 'usr_alex_approved',
    authorName: 'Alex Johnson',
    title: 'Gedanken zur Microservice Skalierbarkeit',
    content: 'Als Creator teile ich hier meine Perspektive zu Event-Driven Architekturen in verteilten Systemen. Freue mich auf euer Feedback und eure Kommentare!',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    tags: ['Creator', 'Opinion'],
    isCreatorTabPost: true,
    rating: 5,
    status: 'approved',
    likes: ['usr_phillip_dev'],
    attachments: [],
  },
];

// Seed notifications
const SEED_NOTIFICATIONS: UserNotification[] = [
  {
    id: 'notif_1',
    userId: 'usr_alex_approved',
    title: 'Verifizierungsstatus aktualisiert',
    message: 'Du hast den blauen Haken von Phillip Dev erhalten! Dein Konto ist jetzt verifiziert.',
    type: 'badge',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    read: false,
  },
  {
    id: 'notif_2',
    userId: 'usr_alex_approved',
    title: 'Konto freigeschaltet!',
    message: 'Dein Konto wurde von Phillip Dev freigeschaltet. Du kannst nun alle Beiträge lesen und Anhänge herunterladen.',
    type: 'success',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    read: true,
  },
  {
    id: 'notif_3',
    userId: 'usr_phillip_dev',
    title: 'Willkommen im Admin-System',
    message: 'Als Entwickler Phillip Dev kannst du Registrierungsanfragen freischalten und Konten verifizieren.',
    type: 'info',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    read: true,
  },
  {
    id: 'notif_4',
    userId: 'usr_sarah_pending',
    title: 'Registrierung eingegangen',
    message: 'Deine Anmeldeanforderung wartet auf Freischaltung durch Phillip Dev.',
    type: 'warning',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
  },
];

// Seed comments
const SEED_COMMENTS: Comment[] = [
  {
    id: 'comm_1',
    postId: 'post_1',
    authorId: 'usr_alex_approved',
    authorName: 'Alex Rivers',
    authorRank: 'creator',
    authorIsVerified: true,
    content: 'Klasse Update! Die neue Architektur v2.4 sieht extrem sauber aus.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'comm_2',
    postId: 'post_1',
    authorId: 'usr_phillip_dev',
    authorName: 'Phillip Dev',
    authorRank: 'admin',
    authorIsVerified: true,
    content: 'Vielen Dank Alex! Bei Fragen zu den Microservice templates stehe ich gerne zur Verfügung.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

// Seed app events & updates
const SEED_APP_EVENTS: AppEvent[] = [
  {
    id: 'ev_1',
    title: 'Benachrichtigungen & Events System',
    description: 'Neues Benachrichtigungssystem für Kontostatus-Updates sowie ein öffentlicher Event-Log für System-Ankündigungen.',
    category: 'added',
    date: new Date().toISOString(),
    version: 'v2.7.0',
  },
  {
    id: 'ev_2',
    title: 'Blauer Haken & Verifizierung',
    description: 'Phillip Dev kann Benutzern nun ein offizielles Verifizierungsabzeichen (blauer Haken) erteilen.',
    category: 'added',
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    version: 'v2.6.0',
  },
  {
    id: 'ev_3',
    title: 'Zweisprachigkeit DE / EN',
    description: 'Vollständige deutsche und englische Lokalisierung der Benutzeroberfläche und Systemnachrichten.',
    category: 'added',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    version: 'v2.5.0',
  },
  {
    id: 'ev_4',
    title: 'Dateianhänge & Snippet-Editor',
    description: 'Erweiterung der Beiträge um hochladbare Dateien und interaktive Quelltext-Snippets.',
    category: 'updated',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    version: 'v2.4.0',
  },
  {
    id: 'ev_5',
    title: 'Unverschlüsselte Alt-Schnittstelle entfernt',
    description: 'Sicherheits-Upgrade: Veraltete Legacy-API-Endpunkte wurden zum Schutz der Benutzerdaten abgeschaltet.',
    category: 'removed',
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    version: 'v2.3.0',
  },
];

// Initialize LocalStorage if not present
export function initializeStorage(): void {
  if (!safeGetItem(USERS_KEY)) {
    safeSetItem(USERS_KEY, JSON.stringify(SEED_USERS));
  } else {
    // Ensure Phillip Dev password in local storage is updated to 'Ingolstadt 2015'
    try {
      const users: (User & { passwordHash: string })[] = JSON.parse(safeGetItem(USERS_KEY) || '[]');
      let updated = false;
      users.forEach(u => {
        if (u.username.toLowerCase().replace(/\s+/g, '') === 'phillipdev') {
          u.passwordHash = 'Ingolstadt 2015';
          u.isVerified = true;
          updated = true;
        }
      });
      if (updated) {
        safeSetItem(USERS_KEY, JSON.stringify(users));
      }
    } catch {}
  }
  if (!safeGetItem(POSTS_KEY)) {
    safeSetItem(POSTS_KEY, JSON.stringify(SEED_POSTS));
  }
  if (!safeGetItem(BOOKMARKS_KEY)) {
    safeSetItem(BOOKMARKS_KEY, JSON.stringify(['post_1']));
  }
  if (!safeGetItem(NOTIFICATIONS_KEY)) {
    safeSetItem(NOTIFICATIONS_KEY, JSON.stringify(SEED_NOTIFICATIONS));
  }
  if (!safeGetItem(APP_EVENTS_KEY)) {
    safeSetItem(APP_EVENTS_KEY, JSON.stringify(SEED_APP_EVENTS));
  }
  if (!safeGetItem(COMMENTS_KEY)) {
    safeSetItem(COMMENTS_KEY, JSON.stringify(SEED_COMMENTS));
  }
  if (!safeGetItem(CURRENT_USER_KEY)) {
    // Default to Phillip Dev for convenience or logged out
    const users = getUsersWithPasswords();
    const phillip = users.find(u => u.username.toLowerCase().replace(/\s+/g, '') === 'phillipdev');
    if (phillip) {
      const { passwordHash, ...safeUser } = phillip;
      safeSetItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    }
  }
}

// User Helpers
export function getUsersWithPasswords(): (User & { passwordHash: string })[] {
  const raw = safeGetItem(USERS_KEY);
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
  const raw = safeGetItem(CURRENT_USER_KEY);
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
    safeSetItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    safeRemoveItem(CURRENT_USER_KEY);
  }
}

// Register a new user (always pending release)
export function registerUser(
  fullName: string,
  username: string,
  password: string,
  confirmPassword: string,
  email?: string
): { success: boolean; user?: User; error?: string } {
  const users = getUsersWithPasswords();
  const trimmedFullName = fullName.trim();
  const trimmedUsername = username.trim();
  const trimmedEmail = email ? email.trim().toLowerCase() : `${trimmedUsername.toLowerCase().replace(/\s+/g, '')}@example.com`;

  if (!trimmedFullName) {
    return { success: false, error: 'Bitte gib deinen vollständigen Namen ein.' };
  }
  if (!trimmedUsername) {
    return { success: false, error: 'Bitte gib einen Benutzernamen ein.' };
  }
  if (!password) {
    return { success: false, error: 'Bitte gib ein Passwort ein.' };
  }
  if (password !== confirmPassword) {
    return { success: false, error: 'Die Passwörter stimmen nicht überein.' };
  }

  if (users.some(u => u.username.toLowerCase() === trimmedUsername.toLowerCase())) {
    return { success: false, error: 'Ein Benutzer mit diesem Benutzernamen existiert bereits.' };
  }

  // Check if registering as Phillip Dev
  const isPhillipDev = trimmedUsername.toLowerCase().replace(/\s+/g, '') === 'phillipdev';

  const newUser: User & { passwordHash: string } = {
    id: `usr_${Date.now()}`,
    fullName: trimmedFullName,
    username: trimmedUsername,
    email: trimmedEmail,
    role: isPhillipDev ? 'admin' : 'user',
    status: isPhillipDev ? 'approved' : 'pending', // Only Phillip Dev is auto-approved, regular users are PENDING
    createdAt: new Date().toISOString(),
    passwordHash: password,
  };

  users.push(newUser);
  safeSetItem(USERS_KEY, JSON.stringify(users));

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

// Notifications Management
export function getAllNotifications(): UserNotification[] {
  const raw = safeGetItem(NOTIFICATIONS_KEY);
  if (!raw) return SEED_NOTIFICATIONS;
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_NOTIFICATIONS;
  }
}

export function getNotifications(userId?: string): UserNotification[] {
  const all = getAllNotifications();
  if (!userId) return all;
  return all.filter(n => n.userId === userId);
}

export function addNotification(
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'badge'
): UserNotification {
  const all = getAllNotifications();
  const newNotif: UserNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    title: title.trim(),
    message: message.trim(),
    type,
    createdAt: new Date().toISOString(),
    read: false,
  };
  all.unshift(newNotif);
  safeSetItem(NOTIFICATIONS_KEY, JSON.stringify(all));
  return newNotif;
}

export function markNotificationRead(notificationId: string): void {
  const all = getAllNotifications();
  const target = all.find(n => n.id === notificationId);
  if (target) {
    target.read = true;
    safeSetItem(NOTIFICATIONS_KEY, JSON.stringify(all));
  }
}

export function markAllNotificationsRead(userId: string): void {
  const all = getAllNotifications();
  all.forEach(n => {
    if (n.userId === userId) {
      n.read = true;
    }
  });
  safeSetItem(NOTIFICATIONS_KEY, JSON.stringify(all));
}

export function clearNotifications(userId: string): void {
  const all = getAllNotifications().filter(n => n.userId !== userId);
  safeSetItem(NOTIFICATIONS_KEY, JSON.stringify(all));
}

// App Events Management (Updates & Timeline)
export function getAppEvents(): AppEvent[] {
  const raw = safeGetItem(APP_EVENTS_KEY);
  if (!raw) return SEED_APP_EVENTS;
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_APP_EVENTS;
  }
}

export function addAppEvent(
  title: string,
  description: string,
  category: 'added' | 'removed' | 'updated' | 'announcement',
  version?: string
): AppEvent {
  const events = getAppEvents();
  const newEv: AppEvent = {
    id: `ev_${Date.now()}`,
    title: title.trim(),
    description: description.trim(),
    category,
    date: new Date().toISOString(),
    version: version?.trim() || `v2.${events.length + 3}.0`,
  };
  events.unshift(newEv);
  safeSetItem(APP_EVENTS_KEY, JSON.stringify(events));
  return newEv;
}

// Release / Approve a pending user (Phillip Dev action)
export function releaseUser(userId: string): boolean {
  const users = getUsersWithPasswords();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return false;

  users[index].status = 'approved';
  safeSetItem(USERS_KEY, JSON.stringify(users));

  // Dispatch notification
  addNotification(
    userId,
    'Konto freigeschaltet!',
    'Dein Konto wurde von Phillip Dev freigeschaltet. Du hast nun vollen Zugriff auf Downloads und Lesezeichen.',
    'success'
  );

  return true;
}

// Toggle Blue Checkmark / Verified status for a user (Phillip Dev action)
export function toggleVerifyUser(userId: string): { success: boolean; isVerified: boolean } {
  const users = getUsersWithPasswords();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return { success: false, isVerified: false };

  const nextVerified = !users[index].isVerified;
  users[index].isVerified = nextVerified;
  safeSetItem(USERS_KEY, JSON.stringify(users));

  // Dispatch notification
  if (nextVerified) {
    addNotification(
      userId,
      'Du hast den blauen Haken erhalten!',
      'Dein Konto wurde offiziell von Phillip Dev verifiziert. Ein blauer Haken wird nun neben deinem Profilnamen angezeigt.',
      'badge'
    );
  } else {
    addNotification(
      userId,
      'Verifizierungsstatus geändert',
      'Dein blauer Haken wurde von Phillip Dev aktualisiert.',
      'info'
    );
  }

  return { success: true, isVerified: nextVerified };
}

// Reject / Revoke a user (Phillip Dev action)
export function removeUser(userId: string): boolean {
  let users = getUsersWithPasswords();
  users = users.filter(u => u.id !== userId);
  safeSetItem(USERS_KEY, JSON.stringify(users));
  return true;
}

// Get user by ID
export function getUserById(userId: string): User | null {
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
}

// Update User Rank (Phillip Dev / Admin action)
export function updateUserRank(userId: string, newRank: UserRank): { success: boolean; rank: UserRank } {
  const users = getUsersWithPasswords();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return { success: false, rank: 'not_granted' };

  users[index].rank = newRank;
  safeSetItem(USERS_KEY, JSON.stringify(users));

  // Friendly label mapping for notifications
  const rankLabels: Record<UserRank, string> = {
    not_granted: 'Nicht gewährt / Not granted',
    normal: 'Normal',
    creator: 'Creator',
    supporter: 'Supporter',
    developer: 'Developer',
    admin: 'Admin',
  };

  addNotification(
    userId,
    'Rang aktualisiert',
    `Dein Rang wurde von Phillip Dev auf "${rankLabels[newRank]}" geändert.`,
    'badge'
  );

  return { success: true, rank: newRank };
}

// Update User Bio
export function updateUserBio(userId: string, bio: string): boolean {
  const users = getUsersWithPasswords();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return false;

  users[index].bio = bio.trim();
  safeSetItem(USERS_KEY, JSON.stringify(users));

  // If current user is updated, refresh current user session
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    currentUser.bio = bio.trim();
    setCurrentUser(currentUser);
  }

  return true;
}

// Update User Avatar URL
export function updateUserAvatar(userId: string, avatarUrl: string): boolean {
  const users = getUsersWithPasswords();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return false;

  users[index].avatarUrl = avatarUrl;
  const success = safeSetItem(USERS_KEY, JSON.stringify(users));

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    currentUser.avatarUrl = avatarUrl;
    setCurrentUser(currentUser);
  }

  return success;
}

// Friend Requests & Relationships
export function getFriendStatus(fromUserId: string, toUserId: string): 'self' | 'friends' | 'pending_sent' | 'pending_received' | 'none' {
  if (fromUserId === toUserId) return 'self';
  const users = getUsers();
  const fromUser = users.find(u => u.id === fromUserId);
  const toUser = users.find(u => u.id === toUserId);

  if (!fromUser || !toUser) return 'none';

  if (fromUser.friends?.includes(toUserId)) return 'friends';
  if (fromUser.friendRequestsSent?.includes(toUserId)) return 'pending_sent';
  if (fromUser.friendRequestsReceived?.includes(toUserId)) return 'pending_received';

  return 'none';
}

export function sendFriendRequest(fromUserId: string, toUserId: string): { success: boolean; error?: string } {
  if (fromUserId === toUserId) return { success: false, error: 'Cannot add yourself.' };
  const users = getUsersWithPasswords();

  const fromIndex = users.findIndex(u => u.id === fromUserId);
  const toIndex = users.findIndex(u => u.id === toUserId);

  if (fromIndex === -1 || toIndex === -1) return { success: false, error: 'User not found.' };

  const fromUser = users[fromIndex];
  const toUser = users[toIndex];

  // Initialize arrays if missing
  fromUser.friendRequestsSent = fromUser.friendRequestsSent || [];
  toUser.friendRequestsReceived = toUser.friendRequestsReceived || [];

  if (fromUser.friendRequestsSent.includes(toUserId)) {
    return { success: false, error: 'Request already sent.' };
  }

  if (fromUser.friends?.includes(toUserId)) {
    return { success: false, error: 'Already friends.' };
  }

  fromUser.friendRequestsSent.push(toUserId);
  toUser.friendRequestsReceived.push(fromUserId);

  safeSetItem(USERS_KEY, JSON.stringify(users));

  // Notify recipient
  addNotification(
    toUserId,
    'Neue Freundschaftsanfrage',
    `${fromUser.username} hat dir eine Freundschaftsanfrage gesendet.`,
    'info'
  );

  return { success: true };
}

export function acceptFriendRequest(userId: string, requesterId: string): { success: boolean } {
  const users = getUsersWithPasswords();

  const uIndex = users.findIndex(u => u.id === userId);
  const rIndex = users.findIndex(u => u.id === requesterId);

  if (uIndex === -1 || rIndex === -1) return { success: false };

  const user = users[uIndex];
  const requester = users[rIndex];

  user.friends = user.friends || [];
  requester.friends = requester.friends || [];

  if (!user.friends.includes(requesterId)) user.friends.push(requesterId);
  if (!requester.friends.includes(userId)) requester.friends.push(userId);

  user.friendRequestsReceived = (user.friendRequestsReceived || []).filter(id => id !== requesterId);
  requester.friendRequestsSent = (requester.friendRequestsSent || []).filter(id => id !== userId);

  safeSetItem(USERS_KEY, JSON.stringify(users));

  // Notify requester
  addNotification(
    requesterId,
    'Freundschaftsanfrage angenommen!',
    `${user.username} hat deine Freundschaftsanfrage angenommen.`,
    'success'
  );

  return { success: true };
}

export function declineFriendRequest(userId: string, requesterId: string): { success: boolean } {
  const users = getUsersWithPasswords();

  const uIndex = users.findIndex(u => u.id === userId);
  const rIndex = users.findIndex(u => u.id === requesterId);

  if (uIndex !== -1) {
    users[uIndex].friendRequestsReceived = (users[uIndex].friendRequestsReceived || []).filter(id => id !== requesterId);
  }
  if (rIndex !== -1) {
    users[rIndex].friendRequestsSent = (users[rIndex].friendRequestsSent || []).filter(id => id !== userId);
  }

  safeSetItem(USERS_KEY, JSON.stringify(users));
  return { success: true };
}

export function removeFriend(userId1: string, userId2: string): { success: boolean } {
  const users = getUsersWithPasswords();

  const idx1 = users.findIndex(u => u.id === userId1);
  const idx2 = users.findIndex(u => u.id === userId2);

  if (idx1 !== -1) {
    users[idx1].friends = (users[idx1].friends || []).filter(id => id !== userId2);
  }
  if (idx2 !== -1) {
    users[idx2].friends = (users[idx2].friends || []).filter(id => id !== userId1);
  }

  safeSetItem(USERS_KEY, JSON.stringify(users));
  return { success: true };
}

// Post Management
export function getPosts(): Post[] {
  const raw = safeGetItem(POSTS_KEY);
  if (!raw) return SEED_POSTS;
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_POSTS;
  }
}

export function createPost(title: string, content: string, attachments: FileAttachment[], tags: string[], author?: User | null): Post {
  const posts = getPosts();
  const authorUser = author || {
    id: 'usr_phillip_dev',
    username: 'Phillip Dev',
  };

  const newPost: Post = {
    id: `post_${Date.now()}`,
    authorId: authorUser.id,
    authorName: authorUser.username,
    title: title.trim(),
    content: content.trim(),
    createdAt: new Date().toISOString(),
    tags: tags.length ? tags : ['Update'],
    attachments,
  };

  posts.unshift(newPost);
  safeSetItem(POSTS_KEY, JSON.stringify(posts));
  return newPost;
}

export function deletePost(postId: string): boolean {
  const posts = getPosts();
  const updatedPosts = posts.filter(p => p.id !== postId);
  safeSetItem(POSTS_KEY, JSON.stringify(updatedPosts));

  // Also remove comments associated with this post
  const comments = getComments();
  const updatedComments = comments.filter(c => c.postId !== postId);
  safeSetItem(COMMENTS_KEY, JSON.stringify(updatedComments));

  return true;
}

// Increment download count
export function recordDownload(postId: string, attachmentId: string): void {
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    const att = post.attachments.find(a => a.id === attachmentId);
    if (att) {
      att.downloadCount = (att.downloadCount || 0) + 1;
      safeSetItem(POSTS_KEY, JSON.stringify(posts));
    }
  }
}

// Bookmarks Management
export function getBookmarks(userId: string): string[] {
  const raw = safeGetItem(`${BOOKMARKS_KEY}_${userId}`);
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
  safeSetItem(`${BOOKMARKS_KEY}_${userId}`, JSON.stringify(updated));
  return updated;
}

// Comments Management
export function getComments(postId?: string): Comment[] {
  const raw = safeGetItem(COMMENTS_KEY);
  let all: Comment[] = [];
  if (!raw) {
    all = SEED_COMMENTS;
  } else {
    try {
      all = JSON.parse(raw);
    } catch {
      all = SEED_COMMENTS;
    }
  }
  if (postId) {
    return all.filter(c => c.postId === postId);
  }
  return all;
}

export function createComment(postId: string, author: User, content: string): Comment {
  const comments = getComments();
  const newComment: Comment = {
    id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    postId,
    authorId: author.id,
    authorName: author.username,
    authorRank: author.rank || 'normal',
    authorIsVerified: author.isVerified || false,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  comments.push(newComment);
  safeSetItem(COMMENTS_KEY, JSON.stringify(comments));

  // Create notification for post author if different
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (post && post.authorId !== author.id) {
    addNotification(
      post.authorId,
      'Neuer Kommentar',
      `${author.username} hat deinen Beitrag "${post.title.slice(0, 25)}..." kommentiert.`,
      'info'
    );
  }

  return newComment;
}

export function deleteComment(commentId: string): boolean {
  const comments = getComments();
  const updated = comments.filter(c => c.id !== commentId);
  safeSetItem(COMMENTS_KEY, JSON.stringify(updated));
  return true;
}

// Permissions Helpers
export function isFullAdmin(user: User | null): boolean {
  if (!user) return false;
  const isDevUsername = user.username.toLowerCase().replace(/\s+/g, '') === 'phillipdev';
  return user.role === 'admin' || user.rank === 'admin' || isDevUsername;
}

export function isDeveloper(user: User | null): boolean {
  if (!user) return false;
  return isFullAdmin(user) || user.rank === 'developer';
}

export function isSupporter(user: User | null): boolean {
  if (!user) return false;
  return isDeveloper(user) || user.rank === 'supporter';
}

export function canApproveUsers(user: User | null): boolean {
  return isDeveloper(user); // Both developers and admins can approve/release users
}

export function canCreateMainPost(user: User | null): boolean {
  if (!user || user.status !== 'approved') return false;
  return isDeveloper(user) || isFullAdmin(user);
}

export function canCreateCreatorPost(user: User | null): boolean {
  if (!user || user.status !== 'approved') return false;
  return user.rank === 'creator' || user.rank === 'developer' || isFullAdmin(user);
}

export function canCreatePost(user: User | null): boolean {
  return canCreateMainPost(user) || canCreateCreatorPost(user);
}

export function canDeletePost(user: User | null, postAuthorId: string): boolean {
  if (!user) return false;
  return isFullAdmin(user) || isDeveloper(user) || isSupporter(user) || user.id === postAuthorId;
}

export function reportPost(postId: string, userId: string, username: string, reason: string): { success: boolean; error?: string } {
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return { success: false, error: 'Post not found.' };

  if (!post.reports) {
    post.reports = [];
  }

  if (post.reports.some(r => r.userId === userId)) {
    return { success: false, error: 'Du hast diesen Beitrag bereits gemeldet.' };
  }

  post.reports.push({
    userId,
    username,
    reason: reason.trim() || 'Unangemessener Inhalt',
    createdAt: new Date().toISOString(),
  });

  safeSetItem(POSTS_KEY, JSON.stringify(posts));

  // Notify supporters, developers, and admins
  const users = getUsers();
  users.forEach(u => {
    if (isSupporter(u) || isDeveloper(u) || isFullAdmin(u)) {
      addNotification(
        u.id,
        'Beitrag gemeldet',
        `Ein Beitrag ("${post.title.slice(0, 20)}...") wurde von ${username} gemeldet (${post.reports?.length || 1} Meldungen). Bitte im Support-Channel prüfen.`,
        'warning'
      );
    }
  });

  return { success: true };
}

export function dismissPostReports(postId: string): boolean {
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return false;

  post.reports = [];
  safeSetItem(POSTS_KEY, JSON.stringify(posts));
  return true;
}

export function getReportedPosts(): Post[] {
  const posts = getPosts();
  return posts.filter(p => p.reports && p.reports.length > 0);
}

export function canDeleteComment(user: User | null, commentAuthorId: string): boolean {
  if (!user) return false;
  return isFullAdmin(user) || isDeveloper(user) || user.id === commentAuthorId;
}

// Creator Tab Helpers & Functions
export function getCreatorPosts(): Post[] {
  const posts = getPosts();
  return posts.filter(p => p.isCreatorTabPost);
}

export function createCreatorPost(title: string, content: string, attachments: FileAttachment[], tags: string[], rating: number, author: User): Post {
  const posts = getPosts();
  const newPost: Post = {
    id: `post_creator_${Date.now()}`,
    authorId: author.id,
    authorName: author.username,
    title: title.trim(),
    content: content.trim(),
    createdAt: new Date().toISOString(),
    tags: tags.length ? tags : ['Creator'],
    attachments,
    isCreatorTabPost: true,
    rating: Math.min(5, Math.max(1, rating)),
    status: 'approved', // Published immediately without pending review
    likes: [],
  };

  posts.unshift(newPost);
  safeSetItem(POSTS_KEY, JSON.stringify(posts));

  return newPost;
}

export function approveCreatorPost(postId: string): boolean {
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.status = 'approved';
    safeSetItem(POSTS_KEY, JSON.stringify(posts));

    addNotification(
      post.authorId,
      'Creator-Beitrag freigeschaltet!',
      `Dein Beitrag "${post.title.slice(0, 25)}..." wurde von Phillip Dev im Creator Tab freigeschaltet.`,
      'success'
    );
    return true;
  }
  return false;
}

export function rejectCreatorPost(postId: string): boolean {
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    const updated = posts.filter(p => p.id !== postId);
    safeSetItem(POSTS_KEY, JSON.stringify(updated));

    addNotification(
      post.authorId,
      'Creator-Beitrag abgelehnt',
      `Dein Beitrag "${post.title.slice(0, 25)}..." wurde von Phillip Dev abgelehnt.`,
      'warning'
    );
    return true;
  }
  return false;
}

export function toggleLikePost(postId: string, userId: string): Post[] {
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    const likes = post.likes || [];
    if (likes.includes(userId)) {
      post.likes = likes.filter(id => id !== userId);
    } else {
      post.likes = [...likes, userId];
    }
    safeSetItem(POSTS_KEY, JSON.stringify(posts));
  }
  return posts;
}

// Creator Applications & Survey Management
const CREATOR_APPLICATIONS_KEY = 'phillip_dev_portal_creator_applications';

export function getCreatorApplications(): CreatorApplication[] {
  const raw = safeGetItem(CREATOR_APPLICATIONS_KEY);
  if (!raw) {
    const seed: CreatorApplication[] = [
      {
        id: 'capp_1',
        userId: 'usr_alex_approved',
        username: 'Alex Johnson',
        email: 'alex@example.com',
        reason: 'Ich möchte Einblicke in Softwarearchitektur und Event-Driven Systeme geben.',
        topics: 'Microservices, TypeScript, Systemdesign',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        status: 'approved',
      }
    ];
    safeSetItem(CREATOR_APPLICATIONS_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function submitCreatorApplication(userId: string, username: string, email: string, reason: string, topics: string): CreatorApplication {
  const apps = getCreatorApplications();
  const newApp: CreatorApplication = {
    id: `capp_${Date.now()}`,
    userId,
    username,
    email,
    reason: reason.trim(),
    topics: topics.trim(),
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  apps.unshift(newApp);
  safeSetItem(CREATOR_APPLICATIONS_KEY, JSON.stringify(apps));

  // Notify all supporters, developers, and admins
  const users = getUsers();
  users.forEach(u => {
    if (isSupporter(u) || isDeveloper(u) || isFullAdmin(u)) {
      addNotification(
        u.id,
        'Neue Creator-Bewerbung eingegangen',
        `${username} möchte Creator werden und hat eine Bewerbung eingereicht, um Beiträge zu schreiben.`,
        'info'
      );
    }
  });

  return newApp;
}

export function approveCreatorApplication(appId: string): boolean {
  const apps = getCreatorApplications();
  const app = apps.find(a => a.id === appId);
  if (!app) return false;

  app.status = 'approved';
  safeSetItem(CREATOR_APPLICATIONS_KEY, JSON.stringify(apps));

  updateUserRank(app.userId, 'creator');

  addNotification(
    app.userId,
    'Creator-Bewerbung angenommen!',
    'Deine Bewerbung als Creator wurde freigeschaltet. Du kannst nun exklusive Creator-Beiträge veröffentlichen!',
    'success'
  );

  return true;
}

export function rejectCreatorApplication(appId: string): boolean {
  const apps = getCreatorApplications();
  const app = apps.find(a => a.id === appId);
  if (!app) return false;

  app.status = 'rejected';
  safeSetItem(CREATOR_APPLICATIONS_KEY, JSON.stringify(apps));

  addNotification(
    app.userId,
    'Creator-Bewerbung abgelehnt',
    'Deine Bewerbung als Creator wurde leider abgelehnt.',
    'warning'
  );

  return true;
}

export function sendCreatorSurveyToUsers(): number {
  const users = getUsers();
  let count = 0;
  users.forEach(u => {
    if (u.status === 'approved' && u.rank !== 'creator' && !isDeveloper(u) && !isFullAdmin(u)) {
      addNotification(
        u.id,
        'Creator-Umfrage & Einladung',
        'Du wurdest zu einer Creator-Befragung eingeladen! Bewirb dich jetzt, um Artikel und Beiträge im Portal zu veröffentlichen.',
        'info'
      );
      count++;
    }
  });
  return count;
}

// Supporter Applications Management
const SUPPORTER_APPLICATIONS_KEY = 'phillip_dev_portal_supporter_applications';

export function getSupporterApplications(): SupporterApplication[] {
  const raw = safeGetItem(SUPPORTER_APPLICATIONS_KEY);
  if (!raw) {
    const seed: SupporterApplication[] = [
      {
        id: 'sapp_1',
        userId: 'usr_sarah_supporter',
        username: 'Sarah Support',
        email: 'sarah@example.com',
        reason: 'Ich möchte dem SZ Portal Team helfen, gemeldete Beiträge zu überprüfen und die Community sicher zu halten.',
        experience: 'Moderatorin in Communities, sehr hilfsbereit',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        status: 'approved',
      }
    ];
    safeSetItem(SUPPORTER_APPLICATIONS_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function submitSupporterApplication(userId: string, username: string, email: string, reason: string, experience: string): SupporterApplication {
  const apps = getSupporterApplications();
  const newApp: SupporterApplication = {
    id: `sapp_${Date.now()}`,
    userId,
    username,
    email,
    reason: reason.trim(),
    experience: experience.trim(),
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  apps.unshift(newApp);
  safeSetItem(SUPPORTER_APPLICATIONS_KEY, JSON.stringify(apps));

  // Notify all supporters, developers, and admins
  const users = getUsers();
  users.forEach(u => {
    if (isSupporter(u) || isDeveloper(u) || isFullAdmin(u)) {
      addNotification(
        u.id,
        'Neue Supporter-Bewerbung eingegangen',
        `${username} möchte Supporter werden und hat eine Bewerbung eingereicht, um das SZ Portal Team zu unterstützen.`,
        'info'
      );
    }
  });

  return newApp;
}

export function approveSupporterApplication(appId: string): boolean {
  const apps = getSupporterApplications();
  const app = apps.find(a => a.id === appId);
  if (!app) return false;

  app.status = 'approved';
  safeSetItem(SUPPORTER_APPLICATIONS_KEY, JSON.stringify(apps));

  updateUserRank(app.userId, 'supporter');

  addNotification(
    app.userId,
    'Supporter-Bewerbung angenommen!',
    'Deine Bewerbung als Supporter wurde freigeschaltet. Du bist nun offiziell im SZ Portal Team!',
    'success'
  );

  return true;
}

export function rejectSupporterApplication(appId: string): boolean {
  const apps = getSupporterApplications();
  const app = apps.find(a => a.id === appId);
  if (!app) return false;

  app.status = 'rejected';
  safeSetItem(SUPPORTER_APPLICATIONS_KEY, JSON.stringify(apps));

  addNotification(
    app.userId,
    'Supporter-Bewerbung abgelehnt',
    'Deine Bewerbung als Supporter wurde leider abgelehnt.',
    'warning'
  );

  return true;
}


