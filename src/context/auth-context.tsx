
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
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [domiciles, setDomiciles] = useState<string[]>([]);
  const [stations, setStations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // This effect runs once on mount to initialize the state from localStorage
    setLoading(true);
    const storedUser = getFromLocalStorage('user', null);
    let storedUsers = getFromLocalStorage('users', []);
    const storedEmployees = getFromLocalStorage('employees', initialEmployees);
    const storedLeaveRequests = getFromLocalStorage('leaveRequests', initialLeaveRequests);
    const storedLeavePolicies = getFromLocalStorage('leavePolicies', initialLeavePolicies);
    const storedLogoUrl = getFromLocalStorage('logoUrl', null);
    const storedDomiciles = getFromLocalStorage('domiciles', ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory']);
    const storedStations = getFromLocalStorage('stations', ["Head Office", "Zonal Office", "Labour Colony"]);
    
    const initialAdminUser: User = {
        id: 'admin',
        name: 'Admin User',
        email: 'sheryarjavedwwb@gmail.com',
        role: 'Admin',
        password: 'admin',
    };

    // Ensure the admin user always exists without wiping other users
    const adminExists = storedUsers.some((u: User) => u.id === 'admin' || u.email === initialAdminUser.email);
    if (!adminExists) {
        storedUsers = [initialAdminUser, ...storedUsers];
    }
    
    setUser(storedUser);
    setUsers(storedUsers);
    setEmployees(storedEmployees);
    setLeaveRequests(storedLeaveRequests);
    setLeavePolicies(storedLeavePolicies);
    setLogoUrl(storedLogoUrl);
    setDomiciles(storedDomiciles);
    setStations(storedStations);

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && user && pathname === '/login') {
      const redirectPath = user.role.toLowerCase() === 'employee' ? '/my-profile' : '/';
      router.push(redirectPath);
    }
  }, [user, loading, pathname, router]);
  
  useEffect(() => {
      if(!loading) saveToLocalStorage('user', user);
  }, [user, loading]);

  useEffect(() => {
    if(!loading) saveToLocalStorage('users', users);
  }, [users, loading]);
  
  useEffect(() => {
    if(!loading) saveToLocalStorage('employees', employees);
  }, [employees, loading]);

  useEffect(() => {
    if(!loading) saveToLocalStorage('leaveRequests', leaveRequests);
  }, [leaveRequests, loading]);

  useEffect(() => {
    if(!loading) saveToLocalStorage('leavePolicies', leavePolicies);
  }, [leavePolicies, loading]);

  useEffect(() => {
    if(!loading) saveToLocalStorage('logoUrl', logoUrl);
  }, [logoUrl, loading]);
  
  useEffect(() => {
    if(!loading) saveToLocalStorage('domiciles', domiciles);
  }, [domiciles, loading]);

  useEffect(() => {
    if(!loading) saveToLocalStorage('stations', stations);
  }, [stations, loading]);

  const login = async (loginId: string, password?: string): Promise<boolean> => {
    setLoading(true);
    let foundUser: User | null = null;
    
    // Always get the freshest data from storage for login check
    const currentUsers = getFromLocalStorage('users', []);
    const currentEmployees = getFromLocalStorage('employees', initialEmployees);

    // Check against the main user list first (admins, operators, etc.)
    const appUser = currentUsers.find((u: User) => u.email === loginId && u.password === password);

    if (appUser) {
        foundUser = { ...appUser };
    } else {
      // If not found, check against the employee list
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
        if((u.id === userId || u.email === userId) && u.password === currentPassword) {
            userFound = true;
            return { ...u, password: newPassword };
        }
        return u;
    });

    if(userFound) {
        setUsers(updatedUsers);
        if (user?.id === userId || user?.email === userId) {
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
      {!loading && children}
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

    