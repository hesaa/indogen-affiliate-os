import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Home,
  Film,
  Link,
  MessageSquare,
  FileText,
  User,
  Settings,
  LogOut,
  TrendingUp,
  Shield,
  Award,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: Home,
    },
    {
      href: '/dashboard/render',
      label: 'Video Render',
      icon: Film,
    },
    {
      href: '/dashboard/links',
      label: 'Cloaked Links',
      icon: Link,
    },
    {
      href: '/dashboard/comments',
      label: 'Comment Sniper',
      icon: MessageSquare,
    },
    {
      href: '/dashboard/landing-pages',
      label: 'Landing Pages',
      icon: FileText,
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  if (!user) return null;

  return (
    <div className="flex flex-col w-64 bg-gray-50 border-r border-gray-200 h-screen">
      {/* Logo and User Info */}
      <div className="flex flex-col items-center p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-blue-600">IGO</span>
          <span className="text-sm font-medium text-gray-500">OS</span>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          {user.email}
        </div>
        {user.plan && (
          <Badge variant="secondary" className="mt-2">
            {user.plan}
          </Badge>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Button
                variant={pathname === item.href ? 'default' : 'ghost'}
                className="w-full justify-start text-left"
                startIcon={<item.icon className="h-4 w-4" />}
                onClick={() => {
                  if (pathname !== item.href) {
                    window.location.href = item.href;
                  }
                }}
              >
                {item.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-left"
          startIcon={<User className="h-4 w-4" />}
          onClick={() => {
            window.location.href = '/dashboard/settings';
          }}
        >
          Profile
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-left mt-2"
          startIcon={<LogOut className="h-4 w-4" />}
          onClick={() => {
            fetch('/api/auth/logout', { method: 'POST' }).then(() => {
              window.location.href = '/';
            });
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}