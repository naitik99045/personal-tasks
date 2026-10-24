import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { X, Lock, Mail, UserCheck, LogOut, ShieldCheck, Zap } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, signInGoogle, signInEmail, signUpEmail, signInGuest, signOut } = useTasks();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await signInGoogle();
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string };
      setErrorMessage(error?.message || 'Google authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await signUpEmail(email, password);
      } else {
        await signInEmail(email, password);
      }
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string };
      setErrorMessage(error?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestAuth = async () => {
    setIsSubmitting(true);
    try {
      await signInGuest();
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error?.message || 'Guest login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--brand-primary)" />
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
              {user && !user.isAnonymous ? 'Firebase Cloud Account' : 'Account & Cloud Sync'}
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        {user && !user.isAnonymous ? (
          <div>
            <div style={{
              padding: '16px',
              backgroundColor: 'var(--surface-overlay)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--surface-border)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  style={{ width: '48px', height: '48px', borderRadius: '999px', objectFit: 'cover', border: '1px solid var(--surface-border)' }}
                />
              ) : (
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--brand-subtle)',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 'var(--font-size-lg)'
                }}>
                  {user.email ? user.email[0].toUpperCase() : 'U'}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.displayName || (user.email ? user.email.split('@')[0] : 'Operative')}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  {user.email}
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '4px',
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--color-success-subtle)',
                  color: 'var(--color-success)',
                  fontWeight: 600
                }}>
                  <UserCheck size={11} />
                  <span>Google / Firebase Synced</span>
                </div>
              </div>
            </div>

            <button
              onClick={async () => { await signOut(); onClose(); }}
              className="btn-secondary"
              style={{ width: '100%', padding: '12px' }}
            >
              <LogOut size={16} />
              <span>Sign Out of Account</span>
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Sign in with Google or Email to link your discipline score, active tasks, and deliverables to Firebase Cloud.
            </p>

            {errorMessage && (
              <div style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-penalty-subtle)',
                color: 'var(--color-penalty)',
                border: '1px solid oklch(40% 0.12 25)',
                fontSize: 'var(--font-size-xs)',
                marginBottom: '14px'
              }}>
                {errorMessage}
              </div>
            )}

            {/* Google 1-Tap Sign In Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleAuth}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-overlay)',
                border: '1px solid var(--surface-border)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: 'var(--font-size-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '16px',
                transition: 'background-color 0.15s ease'
              }}
            >
              {/* Google G SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: '12px 0',
              color: 'var(--text-muted)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--surface-divider)' }} />
              <span>Or with Email</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--surface-divider)' }} />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="operative@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ padding: '12px', marginTop: '4px' }}
              >
                <Lock size={15} />
                <span>{isRegistering ? 'Register with Email' : 'Sign In with Email'}</span>
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                style={{ background: 'none', color: 'var(--brand-primary)', fontSize: 'var(--font-size-xs)', padding: 0 }}
              >
                {isRegistering ? 'Already registered? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>

            <button
              type="button"
              onClick={handleGuestAuth}
              disabled={isSubmitting}
              className="btn-secondary"
              style={{ width: '100%', padding: '12px', fontSize: 'var(--font-size-xs)' }}
            >
              <Zap size={15} color="var(--brand-primary)" />
              <span>Continue as Anonymous Guest</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
