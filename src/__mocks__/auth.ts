import { vi } from 'vitest';

export const mockSession = {
  user: {
    id: 'test-user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
  },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

export const mockAdminSession = {
  user: {
    id: 'test-admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve(mockSession)),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));
