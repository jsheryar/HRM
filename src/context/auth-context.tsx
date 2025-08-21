
'use client';
import { employees as initialEmployees, Employee, LeaveRequest, leaveRequests as initialLeaveRequests, LeavePolicy, leavePolicies as initialLeavePolicies } from '@/lib/data';
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
  leavePolicies: LeavePolicy[];
  setLeavePolicies: React.Dispatch<React.SetStateAction<LeavePolicy[]>>;
  logoUrl: string | null;
  setLogoUrl: React.Dispatch<React.SetStateAction<string | null>>;
  changePassword: (userId: string, currentPassword?: string, newPassword?: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialAdminUser = {
  id: 'admin',
  name: 'Admin User',
  email: 'admin@zoneflow.com',
  role: 'admin' as const,
  photo: 'https://placehold.co/40x40.png',
  password: 'adminpassword'
};

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
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>(() => getFromLocalStorage('leavePolicies', initialLeavePolicies));
  const [logoUrl, setLogoUrl] = useState<string | null>(() => getFromLocalStorage('logoUrl', null));
  const [adminUser, setAdminUser] = useState(() => getFromLocalStorage('adminUser', initialAdminUser));
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = getFromLocalStorage('user', null);
    if(storedUser) {
        setUser(storedUser);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user && pathname === '/login') {
        const redirectPath = user.role === 'admin' ? '/' : '/my-profile';
        router.push(redirectPath);
      }
    }
  }, [user, loading, pathname, router]);
  
  useEffect(() => {
      saveToLocalStorage('user', user);
  }, [user]);

  useEffect(() => {
    saveToLocalStorage('employees', employees);
  }, [employees]);
    
  useEffect(() => {
    saveToLocalStorage('adminUser', adminUser);
  }, [adminUser]);

  useEffect(() => {
    saveToLocalStorage('leaveRequests', leaveRequests);
  }, [leaveRequests]);

  useEffect(() => {
    saveToLocalStorage('leavePolicies', leavePolicies);
  }, [leavePolicies]);

  useEffect(() => {
    saveToLocalStorage('logoUrl', logoUrl);
  }, [logoUrl]);

  const login = async (loginId: string, password?: string): Promise<boolean> => {
    setLoading(true);
    let foundUser: User | null = null;
    
    // Always get the latest employees from localStorage for login check
    const currentEmployees = getFromLocalStorage('employees', initialEmployees);

    // Check for admin user
    if (loginId === adminUser.email && password === adminUser.password) {
      foundUser = {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        photo: adminUser.photo
      };
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
    localStorage.removeItem('user');
    router.push('/login');
  };

  const changePassword = async (userId: string, currentPassword?: string, newPassword?: string): Promise<boolean> => {
    if(!newPassword) return false;

    if (userId === adminUser.id && currentPassword === adminUser.password) {
        setAdminUser(prev => ({...prev, password: newPassword}));
        return true;
    }
    // This part can be extended for employees
    return false;
  };

  const value = {
    user, 
    loading, 
    login, 
    logout, 
    employees, 
    setEmployees, 
    leaveRequests, 
    setLeaveRequests,
    leavePolicies,
    setLeavePolicies,
    logoUrl,
    setLogoUrl,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
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
