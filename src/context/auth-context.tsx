
'use client';
import { employees } from '@/lib/data';
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
  login: (email: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const adminUser = {
  id: 'admin',
  name: 'Admin User',
  email: 'admin@zoneflow.com',
  role: 'admin' as const,
  photo: 'https://placehold.co/40x40.png'
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if(pathname === '/login') {
         router.push(parsedUser.role === 'admin' ? '/' : '/my-profile');
      }
    } else if (pathname !== '/login') {
      router.push('/login');
    }
    setLoading(false);
  }, [router, pathname]);

  const login = async (email: string): Promise<boolean> => {
    setLoading(true);
    // In a real app, you'd verify password too
    let foundUser: User | null = null;
    if (email === adminUser.email) {
      foundUser = adminUser;
    } else {
      const employee = employees.find(emp => emp.email === email);
      if (employee) {
        foundUser = {
          id: employee.id,
          name: employee.fullName,
          email: employee.email,
          role: 'employee',
          photo: employee.photo
        };
      }
    }

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      setLoading(false);
      return true;
    }

    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
