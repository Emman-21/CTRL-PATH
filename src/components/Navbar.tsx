import React from 'react';
import { User } from 'firebase/auth';
import { FolderGit2, LogOut, ExternalLink, HardDrive } from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';

interface NavbarProps {
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isAuthenticating: boolean;
  currentFolderId: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onSignIn,
  onSignOut,
  isAuthenticating,
  currentFolderId,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface-95)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 tracking-tight text-base sm:text-lg">
                Google Drive Reader
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200/60 hidden sm:inline-flex">
                v3 API
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              Inspect, explore, and read files from shared Drive folders
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {currentFolderId && (
            <a
              href={`https://drive.google.com/drive/folders/${currentFolderId}`}
              target="_blank"
              rel="noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
              title="Open currently loaded folder in Google Drive"
            >
              <span>Drive Link</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          )}

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2.5 pl-2 py-1 pr-1 sm:pr-3 rounded-full bg-slate-100/80 border border-slate-200/60">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full ring-1 ring-white object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 leading-tight max-w-[130px] truncate">
                    {user.displayName || 'Google User'}
                  </div>
                  <div className="text-[10px] text-slate-500 max-w-[130px] truncate">
                    {user.email}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onSignOut}
                className="min-w-11 min-h-11 md:min-w-0 md:min-h-0 justify-center p-2 sm:px-3 sm:py-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <GoogleSignInButton
              onClick={onSignIn}
              disabled={isAuthenticating}
              label={isAuthenticating ? 'Connecting...' : 'Sign in with Google'}
            />
          )}
        </div>
      </div>
    </header>
  );
};
