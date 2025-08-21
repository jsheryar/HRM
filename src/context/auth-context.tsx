
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
  login: (loginId: string, password?: string) => Promise<boolean>;
  logout: () => void;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user && pathname === '/login') {
        const redirectPath = user.role === 'admin' ? '/' : '/my-profile';
        router.push(redirectPath);
      } else if (!user && pathname !== '/login') {
        router.push('/login');
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (loginId: string, password?: string): Promise<boolean> => {
    setLoading(true);
    let foundUser: User | null = null;
    
    // Check for admin user
    if (loginId === adminUser.email && password === adminUser.password) {
      foundUser = adminUser;
    } else {
      // Check for employee user by CNIC
      const employee = employees.find(emp => emp.cnic === loginId && emp.password === password);
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
