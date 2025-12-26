'use client';

import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { PermissionsProvider } from '@/hooks/usePermissions';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <PermissionsProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </PermissionsProvider>
  );
}

