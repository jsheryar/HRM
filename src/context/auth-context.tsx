
'use client';
import { User, employees as initialEmployees, Employee, LeaveRequest, leaveRequests as initialLeaveRequests, LeavePolicy, leavePolicies as initialLeavePolicies } from '@/lib/data';
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  domiciles: string[];
  setDomiciles: React.Dispatch<React.SetStateAction<string[]>>;
  stations: string[];
  setStations: React.Dispatch<React.SetStateAction<string[]>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [users, setUsers] = useState<User[]>(() => getFromLocalStorage('users', []));
  const [employees, setEmployees] = useState<Employee[]>(() => getFromLocalStorage('employees', initialEmployees));
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => getFromLocalStorage('leaveRequests', initialLeaveRequests));
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>(() => getFromLocalStorage('leavePolicies', initialLeavePolicies));
  const [logoUrl, setLogoUrl] = useState<string | null>(() => getFromLocalStorage('logoUrl', null));
  const [domiciles, setDomiciles] = useState<string[]>(() => getFromLocalStorage('domiciles', ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory']));
  const [stations, setStations] = useState<string[]>(() => getFromLocalStorage('stations', ["Head Office", "Zonal Office", "Labour Colony"]));
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = getFromLocalStorage('user', null);
    if(storedUser) {
        setUser(storedUser);
    }
    const initialAdminUser: User = {
        id: 'admin',
        name: 'Admin User',
        email: 'sheryarjavedwwb@gmail.com',
        role: 'Admin',
        password: 'admin',
    };
    const currentUsers = getFromLocalStorage('users', []);
     if (currentUsers.length === 0 || !currentUsers.find((u:User) => u.role === 'Admin')) {
        const adminExists = currentUsers.some((u:User) => u.id === 'admin');
        if (!adminExists) {
            currentUsers.push(initialAdminUser);
        }
    }
    setUsers(currentUsers);

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && user && pathname === '/login') {
      const redirectPath = user.role.toLowerCase() === 'employee' ? '/my-profile' : '/';
      router.push(redirectPath);
    }
  }, [user, loading, pathname, router]);
  
  useEffect(() => {
      saveToLocalStorage('user', user);
  }, [user]);

  useEffect(() => {
    saveToLocalStorage('users', users);
  }, [users]);
  
  useEffect(() => {
    saveToLocalStorage('employees', employees);
  }, [employees]);

  useEffect(() => {
    saveToLocalStorage('leaveRequests', leaveRequests);
  }, [leaveRequests]);

  useEffect(() => {
    saveToLocalStorage('leavePolicies', leavePolicies);
  }, [leavePolicies]);

  useEffect(() => {
    saveToLocalStorage('logoUrl', logoUrl);
  }, [logoUrl]);
  
  useEffect(() => {
    saveToLocalStorage('domiciles', domiciles);
  }, [domiciles]);

  useEffect(() => {
    saveToLocalStorage('stations', stations);
  }, [stations]);

  const login = async (loginId: string, password?: string): Promise<boolean> => {
    setLoading(true);
    let foundUser: User | null = null;
    
    const currentUsers = getFromLocalStorage('users', []);
    const currentEmployees = getFromLocalStorage('employees', initialEmployees);

    // Check against all non-employee users first
    const appUser = currentUsers.find((u: User) => u.email === loginId && u.password === password);

    if (appUser) {
        // Any user from the 'users' list is a valid app user (Admin, Sub Admin, Editor, etc.)
        foundUser = { ...appUser };
    } else {
      // If not found in app users, check if it's an employee
      const employee = currentEmployees.find((emp: Employee) => emp.cnic === loginId && emp.password === password);
      if (employee) {
        foundUser = {
          id: employee.cnic,
          name: employee.fullName,
          email: employee.email,
          role: 'employee',
          photo: employee.photo,
          password: employee.password
        };
      }
    }

    if (foundUser) {
      saveToLocalStorage('user', foundUser); 
      setUser(foundUser);
      setLoading(false);
      return true;
    }

    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
    }
    router.push('/login');
  };

  const changePassword = async (userId: string, currentPassword?: string, newPassword?: string): Promise<boolean> => {
    if(!newPassword) return false;
    
    let userFound = false;
    const updatedUsers = users.map(u => {
        if(u.id === userId && u.password === currentPassword) {
            userFound = true;
            return { ...u, password: newPassword };
        }
        return u;
    });

    if(userFound) {
        setUsers(updatedUsers);
        if (user?.id === userId) {
            setUser(prevUser => prevUser ? {...prevUser, password: newPassword} : null);
        }
        return true;
    }
    
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
    users,
    setUsers,
    domiciles,
    setDomiciles,
    stations,
    setStations
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
