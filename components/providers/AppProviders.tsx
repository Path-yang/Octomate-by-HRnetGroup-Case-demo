'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { PermissionsProvider } from '@/hooks/usePermissions';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <PermissionsProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </PermissionsProvider>
    </ThemeProvider>
  );
}

