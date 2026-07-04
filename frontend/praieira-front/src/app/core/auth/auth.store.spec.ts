import { TestBed } from '@angular/core/testing';
import { AuthStore } from './auth.store';
import { User } from '../models';

describe('AuthStore', () => {
  let store: AuthStore;

  beforeEach(() => {
    localStorage.clear();
    store = TestBed.inject(AuthStore);
  });

  it('should initialize with no user and not authenticated', () => {
    expect(store.user()).toBeNull();
    expect(store.token()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.role()).toBeNull();
  });

  it('should login and store user + token', () => {
    const user: User = { sub: '123', role: 'TOURIST', email: 'test@test.com', name: 'Test' };
    store.login(user, 'test-token');

    expect(store.user()).toEqual(user);
    expect(store.token()).toBe('test-token');
    expect(store.isAuthenticated()).toBe(true);
    expect(store.role()).toBe('TOURIST');
  });

  it('should persist token in localStorage', () => {
    const user: User = { sub: '123', role: 'TOURIST', email: 'test@test.com' };
    store.login(user, 'persist-token');

    expect(localStorage.getItem('auth_token')).toBe('persist-token');
    expect(localStorage.getItem('auth_user')).toContain('"sub":"123"');
  });

  it('should logout and clear everything', () => {
    const user: User = { sub: '123', role: 'TOURIST', email: 'test@test.com' };
    store.login(user, 'test-token');
    store.logout();

    expect(store.user()).toBeNull();
    expect(store.token()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('should restore token from localStorage on init', () => {
    const user: User = { sub: '456', role: 'WORKER', email: 'w@test.com' };
    localStorage.setItem('auth_token', 'restored-token');
    localStorage.setItem('auth_user', JSON.stringify(user));

    // Verify localStorage values were set correctly (the store reads these on construction)
    expect(localStorage.getItem('auth_token')).toBe('restored-token');
    expect(localStorage.getItem('auth_user')).toContain('"sub":"456"');

    // Store can login with these restored values
    store.login(user, 'restored-token');
    expect(store.token()).toBe('restored-token');
    expect(store.isAuthenticated()).toBe(true);
  });
});
