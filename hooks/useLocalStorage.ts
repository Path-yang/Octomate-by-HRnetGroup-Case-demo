'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize with a function to avoid SSR issues
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Read from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item) as T;
        setStoredValue(parsed);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    setIsInitialized(true);
  }, [key]);

  // Update localStorage when value changes
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

// Hook for managing employee data
export function useEmployeeStorage() {
  const [employees, setEmployees] = useLocalStorage<any[]>('octomate_employees', []);
  
  const addEmployee = useCallback((employee: any) => {
    setEmployees((prev) => [...prev, { ...employee, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
  }, [setEmployees]);

  const updateEmployee = useCallback((id: string, updates: Partial<any>) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, ...updates, updatedAt: new Date().toISOString() } : emp
      )
    );
  }, [setEmployees]);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
  }, [setEmployees]);

  const getEmployee = useCallback((id: string) => {
    return employees.find((emp) => emp.id === id);
  }, [employees]);

  return {
    employees,
    setEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployee,
  };
}

// Hook for managing audit logs
export function useAuditStorage() {
  const [auditLogs, setAuditLogs] = useLocalStorage<any[]>('octomate_audit_logs', []);

  const addAuditLog = useCallback((log: any) => {
    setAuditLogs((prev) => [
      { ...log, id: `audit-${Date.now()}`, timestamp: new Date().toISOString() },
      ...prev,
    ]);
  }, [setAuditLogs]);

  return {
    auditLogs,
    setAuditLogs,
    addAuditLog,
  };
}
