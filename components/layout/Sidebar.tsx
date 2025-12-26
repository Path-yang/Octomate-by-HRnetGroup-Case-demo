'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Users,
  LayoutDashboard,
  FileText,
  Settings,
  HelpCircle,
  Shield,
  Building2,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAdmin?: boolean;
  disabled?: boolean;
}

const mainNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'All Employees', href: '/employees', icon: Users },
  { name: 'Add Employee', href: '/employees/new', icon: UserPlus, requiresAdmin: true },
];

const managementNavigation: NavItem[] = [
  { name: 'Audit Logs', href: '/audit', icon: FileText, requiresAdmin: true },
  { name: 'Departments', href: '/departments', icon: Building2, disabled: true },
  { name: 'Access Control', href: '/access', icon: Shield, disabled: true },
];

const settingsNavigation: NavItem[] = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help & Support', href: '/help', icon: HelpCircle, disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { canViewAudit, canAdd } = usePermissions();

  const filterByPermission = (items: typeof mainNavigation) => {
    return items.filter((item) => {
      if (item.requiresAdmin) {
        return item.name === 'Add Employee' ? canAdd() : canViewAudit();
      }
      return true;
    });
  };

  const NavLink = ({
    item,
    compact = false,
  }: {
    item: NavItem;
    compact?: boolean;
  }) => {
    const isActive = pathname === item.href;
    const isDisabled = item.disabled === true;

    return (
      <Link
        href={isDisabled ? '#' : item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-[#00A651] text-white shadow-sm'
            : isDisabled
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
          compact && 'py-2'
        )}
        onClick={(e) => isDisabled && e.preventDefault()}
      >
        <item.icon className={cn('h-5 w-5', isActive && 'text-white')} />
        <span className="flex-1">{item.name}</span>
        {isDisabled && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            Soon
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-gray-50/50 dark:bg-gray-900/50">
      <div className="flex flex-col flex-1 p-4 gap-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Main
          </h3>
          {filterByPermission(mainNavigation).map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </div>

        <Separator />

        {/* Management */}
        <div className="space-y-1">
          <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Management
          </h3>
          {filterByPermission(managementNavigation).map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </div>

        <Separator />

        {/* Settings */}
        <div className="space-y-1">
          <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            System
          </h3>
          {settingsNavigation.map((item) => (
            <NavLink key={item.name} item={item} compact />
          ))}
        </div>

        {/* Bottom section */}
        <div className="mt-auto">
          <div className="rounded-lg bg-gradient-to-br from-[#00A651]/10 to-[#00A651]/5 p-4 border border-[#00A651]/20">
            <div className="flex items-center gap-2 mb-2">
              <Image
                src="/logo.jpeg"
                alt="Octomate Logo"
                width={24}
                height={24}
                className="rounded"
              />
              <h4 className="font-semibold text-sm">PM Assessment Demo</h4>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              This is a demonstration of the Octomate HR system capabilities.
            </p>
            <Link href="/settings">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-[#00A651] border-[#00A651]/30 hover:bg-[#00A651]/10"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

