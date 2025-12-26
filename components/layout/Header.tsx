'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Users,
  LayoutDashboard,
  FileText,
  Settings,
  Bell,
  Search,
  Moon,
  Sun,
  Menu,
  ChevronDown,
  Shield,
  UserCircle,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/lib/types';
import { getRoleDisplayName, getRoleBadgeVariant } from '@/lib/permissions';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Audit Logs', href: '/audit', icon: FileText, requiresAdmin: true },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const roleOptions: { role: UserRole; icon: React.ElementType; description: string }[] = [
  { role: 'hr_admin', icon: Shield, description: 'Full access to all data and features' },
  { role: 'manager', icon: Briefcase, description: 'Read-only access, no banking data' },
  { role: 'employee', icon: UserCircle, description: 'Self-service access only' },
];

export function Header() {
  const pathname = usePathname();
  const { currentUser, currentRole, setRole, canViewAudit } = usePermissions();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const filteredNavigation = navigation.filter(
    (item) => !item.requiresAdmin || canViewAudit()
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/95 dark:supports-[backdrop-filter]:bg-gray-950/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Mobile menu button */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="flex items-center gap-2 mb-8">
              <Image
                src="/logo.jpeg"
                alt="Octomate Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold text-lg">Octomate</span>
            </div>
            <nav className="flex flex-col gap-2">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-[#00A651]/10 text-[#00A651]'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Image
            src="/logo.jpeg"
            alt="Octomate Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-bold text-lg hidden sm:block">Octomate</span>
          <Badge variant="secondary" className="hidden sm:flex text-[10px] px-1.5 py-0">
            by HRnet
          </Badge>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-[#00A651]/10 text-[#00A651]'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Search */}
          <div className="hidden lg:flex relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              className="w-64 pl-9 h-9 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {/* Role Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">{getRoleDisplayName(currentRole)}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="text-xs text-gray-500 font-normal">
                Switch Role (Demo Mode)
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {roleOptions.map(({ role, icon: Icon, description }) => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => setRole(role)}
                  className={cn(
                    'flex flex-col items-start gap-1 py-3 cursor-pointer',
                    currentRole === role && 'bg-[#00A651]/10'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{getRoleDisplayName(role)}</span>
                    {currentRole === role && (
                      <Badge variant="default" className="bg-[#00A651] text-[10px] px-1.5 py-0">
                        Active
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 ml-6">{description}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Dark mode toggle */}
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="bg-[#00A651] text-white text-sm">
                    {currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-sm font-medium">{currentUser.name}</span>
                  <span className="text-xs text-gray-500">{getRoleDisplayName(currentRole)}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/employees/${currentUser.employeeId}`} className="cursor-pointer">
                  View My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">Preferences</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 cursor-pointer">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

