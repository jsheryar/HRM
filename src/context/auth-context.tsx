
'use client';
import { employees as initialEmployees, Employee, LeaveRequest, leaveRequests as initialLeaveRequests } from '@/lib/data';
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  photo?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (loginId: string, password?: string) => Promise<boolean>;
  logout: () => void;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  leaveRequests: LeaveRequest[];
  setLeaveRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const adminUser = {
  id: 'admin',
  name: 'Admin User',
  email: 'admin@zoneflow.com',
  role: 'admin' as const,
  photo: 'https://placehold.co/40x40.png',
  password: 'adminpassword'
};

// A helper function to manage the user cookie
const setUserCookie = (user: User | null) => {
    if (typeof window === 'undefined') return;
    if (user) {
        document.cookie = `user=${JSON.stringify(user)}; path=/; max-age=86400`; // Expires in 1 day
    } else {
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'; // Delete cookie
    }
}

// Helper functions for localStorage to handle server-side rendering
const getFromLocalStorage = (key: string, defaultValue: any) => {
    if (typeof window !== 'undefined') {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            try {
                return JSON.parse(storedValue);
            } catch (e) {
                console.error(`Error parsing localStorage key "${key}":`, e);
                return defaultValue;
            }
        }
    }
    return defaultValue;
}

const saveToLocalStorage = (key: string, value: any) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
    }
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => getFromLocalStorage('user', null));
  const [employees, setEmployees] = useState<Employee[]>(() => getFromLocalStorage('employees', initialEmployees));
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => getFromLocalStorage('leaveRequests', initialLeaveRequests));
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = getFromLocalStorage('user', null);
    setUser(storedUser);
    setUserCookie(storedUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user && pathname === '/login') {
        const redirectPath = user.role === 'admin' ? '/' : '/my-profile';
        router.push(redirectPath);
      }
      // Middleware now handles redirecting unauthenticated users
    }
  }, [user, loading, pathname, router]);
  
  useEffect(() => {
      saveToLocalStorage('user', user);
      setUserCookie(user);
  }, [user]);

  useEffect(() => {
    saveToLocalStorage('employees', employees);
  }, [employees]);

  useEffect(() => {
    saveToLocalStorage('leaveRequests', leaveRequests);
  }, [leaveRequests]);

  const login = async (loginId: string, password?: string): Promise<boolean> => {
    setLoading(true);
    let foundUser: User | null = null;
    
    // Always get the latest employees from localStorage for login check
    const currentEmployees = getFromLocalStorage('employees', initialEmployees);

    // Check for admin user
    if (loginId === adminUser.email && password === adminUser.password) {
      foundUser = adminUser;
    } else {
      // Check for employee user by CNIC
      const employee = currentEmployees.find((emp: Employee) => emp.cnic === loginId && emp.password === password);
      if (employee) {
        foundUser = {
          id: employee.cnic, // Use CNIC as the user ID
          name: employee.fullName,
          email: employee.email,
          role: 'employee',
          photo: employee.photo
        };
      }
    }

    if (foundUser) {
      setUser(foundUser);
      setLoading(false);
      return true;
    }

    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, employees, setEmployees, leaveRequests, setLeaveRequests }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
