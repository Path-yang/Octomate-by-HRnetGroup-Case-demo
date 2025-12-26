'use client';

import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { UserRole, User, TabPermissions, Employee } from '@/lib/types';
import { getPermissions, canViewEmployee, canEditEmployee, canViewAuditLogs, canExportData, canBulkImport, canAddEmployee, canDeleteEmployee } from '@/lib/permissions';
import { mockUsers, getUserByRole } from '@/lib/mock-data';
import { useLocalStorage } from './useLocalStorage';

interface PermissionsContextType {
  currentUser: User;
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  getTabPermissions: (employeeId?: string) => TabPermissions;
  canView: (employeeId: string) => boolean;
  canEdit: (employeeId: string) => boolean;
  canViewAudit: () => boolean;
  canExport: () => boolean;
  canImport: () => boolean;
  canAdd: () => boolean;
  canDelete: () => boolean;
  isSelfProfile: (employeeId: string) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function usePermissionsProvider() {
  const [storedRole, setStoredRole] = useLocalStorage<UserRole>('octomate_user_role', 'hr_admin');
  const [currentUser, setCurrentUser] = useState<User>(getUserByRole('hr_admin'));
  const [currentRole, setCurrentRole] = useState<UserRole>('hr_admin');

  // Sync with stored role on mount
  useEffect(() => {
    const user = getUserByRole(storedRole);
    setCurrentUser(user);
    setCurrentRole(storedRole);
  }, [storedRole]);

  const setRole = useCallback((role: UserRole) => {
    const user = getUserByRole(role);
    setCurrentUser(user);
    setCurrentRole(role);
    setStoredRole(role);
  }, [setStoredRole]);

  const isSelfProfile = useCallback((employeeId: string): boolean => {
    return currentUser.employeeId === employeeId;
  }, [currentUser.employeeId]);

  const getTabPermissions = useCallback((employeeId?: string): TabPermissions => {
    const isSelf = employeeId ? isSelfProfile(employeeId) : false;
    return getPermissions(currentRole, isSelf);
  }, [currentRole, isSelfProfile]);

  const canView = useCallback((employeeId: string): boolean => {
    return canViewEmployee(currentRole, employeeId, currentUser.employeeId);
  }, [currentRole, currentUser.employeeId]);

  const canEdit = useCallback((employeeId: string): boolean => {
    return canEditEmployee(currentRole, employeeId, currentUser.employeeId);
  }, [currentRole, currentUser.employeeId]);

  const canViewAudit = useCallback((): boolean => {
    return canViewAuditLogs(currentRole);
  }, [currentRole]);

  const canExport = useCallback((): boolean => {
    return canExportData(currentRole);
  }, [currentRole]);

  const canImport = useCallback((): boolean => {
    return canBulkImport(currentRole);
  }, [currentRole]);

  const canAdd = useCallback((): boolean => {
    return canAddEmployee(currentRole);
  }, [currentRole]);

  const canDelete = useCallback((): boolean => {
    return canDeleteEmployee(currentRole);
  }, [currentRole]);

  return {
    currentUser,
    currentRole,
    setRole,
    getTabPermissions,
    canView,
    canEdit,
    canViewAudit,
    canExport,
    canImport,
    canAdd,
    canDelete,
    isSelfProfile,
  };
}

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const permissions = usePermissionsProvider();

  return (
    <PermissionsContext.Provider value={permissions}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}

// Hook for managing form field states based on permissions
export function useFieldPermission(
  permission: { read: boolean; write: boolean; masked: boolean },
  isEditing: boolean = false
) {
  return {
    isVisible: permission.read,
    isEditable: permission.write && isEditing,
    isMasked: permission.masked,
    isReadOnly: !permission.write,
  };
}

