import { Link } from '@tanstack/react-router';
import { Bell, BellOff, LogOut, Moon, Sun, User } from 'lucide-react';
import { useState } from 'react';

import { usePushNotifications } from '~/hooks/use-push-notifications';
import { useTheme } from '~/hooks/use-theme';
import { authClient } from '~/lib/auth-client';

interface UserMenuProps {
  compact?: boolean;
}

export function UserMenu({ compact }: UserMenuProps) {
  const { data: session } = authClient.useSession();
  const { theme, toggle } = useTheme();
  const push = usePushNotifications();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = () => {
    authClient.signOut({ fetchOptions: { onSuccess: () => window.location.reload() } });
  };

  const avatarSize = compact ? 'w-7 h-7' : 'w-8 h-8';
  const iconSize = compact ? 14 : 16;

  return (
    <div className="flex items-center gap-1 md:gap-2">
      <button
        type="button"
        onClick={toggle}
        className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {session ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center rounded-full hover:ring-2 hover:ring-primary/30 transition-all"
          >
            {session.user.image ? (
              <img src={session.user.image} alt="" className={`${avatarSize} rounded-full`} />
            ) : (
              <div
                className={`${avatarSize} rounded-full bg-primary/20 flex items-center justify-center`}
              >
                <User size={iconSize} className="text-primary" />
              </div>
            )}
          </button>

          {menuOpen && (
            <>
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop overlay */}
              {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop overlay */}
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-10 md:top-12 z-50 w-48 md:w-56 bg-surface-container border border-outline-variant/30 rounded-xl p-2 shadow-xl dark:shadow-[0_8px_32px_rgba(139,92,246,0.15)] dark:border-primary/20">
                <div className="px-3 py-2 mb-1 border-b border-outline-variant/20">
                  <p className="text-sm font-medium text-on-surface truncate">
                    {session.user.name}
                  </p>
                  {!compact && (
                    <p className="text-xs text-on-surface-variant truncate">{session.user.email}</p>
                  )}
                </div>
                {push.supported && (
                  <button
                    type="button"
                    onClick={push.toggle}
                    disabled={push.loading}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {push.subscribed ? <BellOff size={iconSize} /> : <Bell size={iconSize} />}
                    {push.subscribed ? 'Disable Notifications' : 'Enable Notifications'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-error hover:bg-white/5 rounded-lg transition-colors"
                >
                  <LogOut size={iconSize} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <Link
          to="/login"
          className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-on-primary bg-primary rounded-lg hover:bg-primary-light transition-colors"
        >
          Sign In
        </Link>
      )}
    </div>
  );
}
