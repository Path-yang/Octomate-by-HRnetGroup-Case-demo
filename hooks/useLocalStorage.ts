'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate on mount
  useEffect(() => {
    setStoredValue(readValue());
    setIsHydrated(true);
  }, [readValue]);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          
          // Dispatch a custom event so other components using the same key can update
          window.dispatchEvent(new StorageEvent('storage', {
            key,
            newValue: JSON.stringify(valueToStore),
          }));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue) as T);
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, isHydrated] as const;
}

// Hook for managing employee data
export function useEmployeeStorage() {
  const [employees, setEmployees, isHydrated] = useLocalStorage<any[]>('octomate_employees', []);
  
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
    isHydrated,
  };
}

// Hook for managing audit logs
export function useAuditStorage() {
  const [auditLogs, setAuditLogs, isHydrated] = useLocalStorage<any[]>('octomate_audit_logs', []);

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
    isHydrated,
  };
}

