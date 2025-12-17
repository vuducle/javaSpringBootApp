import {
  Home,
  Plus,
  Book,
  User as UserIcon,
  Menu,
  X,
  Briefcase,
  GraduationCap,
  LogOut,
  Key,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch } from '@/store';
import { clearUser, User } from '@/store/slices/userSlice';
import api from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { Button } from '../ui/button';
import { ThemeToggleButton } from './ThemeToggleButton';
import { Logo } from '../ui/Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function Navbar({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const isAuthenticated = user.istEingeloggt;
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      // Try server-side logout to clear HttpOnly cookie and invalidate refresh token
      await api.post('/api/auth/logout', {
        refreshToken: user.refreshToken,
      });
    } catch (error) {
      console.warn(
        'Server logout failed, proceeding to clear client state',
        error
      );
      showToast(
        'Logout failed server-side, local session cleared',
        'warning'
      );
    } finally {
      dispatch(clearUser());
      router.push('/login');
    }
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    {
      href: '/about',
      label: 'Über die App',
      icon: Info,
    },
    {
      href: '/erstellen',
      label: 'Erstellen',
      icon: Plus,
      userOnly: true,
    },
    {
      href: '/user-erstellen',
      label: 'User Erstellen',
      icon: Plus,
      adminOnly: true,
    },
    {
      href: '/nachweise-anschauen',
      label: 'Nachweise anschauen',
      icon: Book,
    },
    {
      href: '/audit-logs',
      label: 'Audit-Logs',
      icon: Briefcase,
      adminOnly: true,
    },
    { href: '/profil', label: 'Profil', icon: UserIcon },
  ];

  const isAdmin =
    user.roles.includes('ROLE_ADMIN') ||
    user.roles.includes('ROLE_AUSBILDER');
  const isUser = user.roles.includes('ROLE_USER');
  const RoleIcon = isAdmin ? Briefcase : GraduationCap;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card dark:bg-card border-b-chart-1 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Logo />
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => {
                if (link.adminOnly && !isAdmin) {
                  return null;
                }
                if (link.userOnly && !isUser) {
                  return null;
                }
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/' &&
                    pathname?.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-foreground hover:bg-accent'
                    } px-3 py-2 rounded-md text-sm font-medium flex items-center`}
                  >
                    <link.icon className="mr-2 h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <RoleIcon className="h-6 w-6 text-foreground" />
              <LanguageSwitcher />
              <ThemeToggleButton />
              <Button onClick={handleLogout}>
                <LogOut />
                Logout
              </Button>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-accent focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              if (link.adminOnly && !isAdmin) {
                return null;
              }
              if (link.userOnly && !isUser) {
                return null;
              }
              const isActive =
                pathname === link.href ||
                (link.href !== '/' &&
                  pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-foreground hover:bg-accent'
                  } px-3 py-2 rounded-md text-base font-medium flex items-center`}
                >
                  <link.icon className="mr-2 h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-5 space-x-4">
              <RoleIcon className="h-6 w-6 text-foreground" />
              <LanguageSwitcher />
              <ThemeToggleButton />
              {isAuthenticated ? (
                <Button onClick={handleLogout} className="w-full">
                  <LogOut />
                  Logout
                </Button>
              ) : (
                <Button asChild className="w-full">
                  <Link href="/login">
                    <Key />
                    Login
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
