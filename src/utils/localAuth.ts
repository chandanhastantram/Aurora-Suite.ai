export interface LocalUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  provider: string;
  created_at: string;
  passwordHash?: string; // Simulated hash for local DB
}

// ── Local Mock Database Helpers ──
const getLocalDB = (): LocalUser[] => {
  const db = localStorage.getItem('aurora_local_db');
  return db ? JSON.parse(db) : [];
};

const saveLocalDB = (users: LocalUser[]) => {
  localStorage.setItem('aurora_local_db', JSON.stringify(users));
};

// ── Authentication Actions ──
export const registerLocalUser = (email: string, passwordHash: string): LocalUser => {
  const db = getLocalDB();
  if (db.find(u => u.email === email)) {
    throw new Error('This email is already registered.');
  }
  
  const newUser: LocalUser = {
    id: 'user-' + Date.now(),
    email,
    name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    avatar_url: '',
    provider: 'local',
    created_at: new Date().toISOString(),
    passwordHash,
  };
  
  db.push(newUser);
  saveLocalDB(db);
  return newUser;
};

export const validateLocalLogin = (email: string, passwordHash: string): LocalUser => {
  const db = getLocalDB();
  const user = db.find(u => u.email === email);
  if (!user || user.passwordHash !== passwordHash) {
    throw new Error('Invalid email or password.');
  }
  return user;
};

// ── Session Flow ──
export const saveLocalSession = (user: LocalUser): LocalUser => {
  // Strip sensitive info before saving active session
  const safeSession = { ...user };
  delete safeSession.passwordHash;
  localStorage.setItem('aurora_auth_session', JSON.stringify(safeSession));
  return safeSession;
};

export const getLocalSession = (): LocalUser | null => {
  const saved = localStorage.getItem('aurora_auth_session');
  return saved ? JSON.parse(saved) : null;
};

export const clearLocalSession = () => {
  localStorage.removeItem('aurora_auth_session');
};

export const handleOAuthLocal = (displayName: string, provider: string): LocalUser => {
  const email = `${displayName.toLowerCase().replace(/\s+/g, '.')}@aurora.ai`;
  const mockUser: LocalUser = {
    id: `oauth-${Date.now()}`,
    email,
    name: displayName,
    avatar_url: '',
    provider,
    created_at: new Date().toISOString(),
  };
  return saveLocalSession(mockUser);
};
