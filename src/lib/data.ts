
export type Transfer = {
  station: string;
  fromDate: string;
  toDate: string | null;
};

export type Training = {
  name: string;
  date: string;
};

export type Certificate = {
  name: string;
  date: string;
};

export type Employee = {
  id: string;
  fullName: string;
  fatherName: string;
  cnic: string;
  password?: string;
  mobileNumber: string;
  email: string;
  photo: string;
  department: string;
  designation: string;
  bps: string;
  education: string;
  station: 'Head Office' | 'Zonal Office' | 'Labour Colony';
  employmentType: 'Permanent' | 'Contract' | 'Daily-wage';
  dateOfAppointment: string;
  dateOfBirth: string;
  transferHistory: Transfer[];
  status: 'Active' | 'Inactive';
  trainings: Training[];
  certificates: Certificate[];
};

export type LeaveStatusChange = {
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp: string; // ISO string
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  statusHistory: LeaveStatusChange[];
};

export type LeavePolicy = {
  id: string;
  type: string;
  balance: number;
};

export type User = {
    id: string;
    name: string;
    email: string;
    password?: string;
    photo?: string;
    role: 'Admin' | 'Sub Admin' | 'Editor' | 'Data Entry Operator' | 'employee';
}


export const employees: Employee[] = [
  {
    id: '12345-1234567-1',
    fullName: 'Aarav Sharma',
    fatherName: 'Suresh Sharma',
    cnic: '12345-1234567-1',
    password: 'password',
    mobileNumber: '0300-1234567',
    email: 'aarav.sharma@example.com',
    photo: 'https://placehold.co/100x100.png',
    department: 'Technology',
    designation: 'Software Engineer',
    bps: 'BPS-17',
    education: 'M.Sc. Computer Science',
    station: 'Head Office',
    employmentType: 'Permanent',
    dateOfAppointment: '2022-08-15',
    dateOfBirth: '1995-02-20',
    transferHistory: [],
    status: 'Active',
    trainings: [{ name: 'Advanced React', date: '2023-10-15' }, { name: 'Node.js Fundamentals', date: '2023-05-20' }],
    certificates: [{ name: 'Certified JavaScript Developer', date: '2023-12-01' }],
  },
  {
    id: '12345-1234567-2',
    fullName: 'Diya Patel',
    fatherName: 'Ramesh Patel',
    cnic: '12345-1234567-2',
    password: 'password',
    mobileNumber: '0300-2345678',
    email: 'diya.patel@example.com',
    photo: 'https://placehold.co/100x100.png',
    department: 'Human Resources',
    designation: 'HR Manager',
    bps: 'BPS-18',
    education: 'MBA in HR',
    station: 'Zonal Office',
    employmentType: 'Permanent',
    dateOfAppointment: '2021-05-20',
    dateOfBirth: '1990-08-10',
    transferHistory: [],
    status: 'Active',
    trainings: [{ name: 'Conflict Resolution', date: '2022-03-10' }, { name: 'Talent Acquisition', date: '2022-09-01' }],
    certificates: [{ name: 'SHRM-CP', date: '2023-01-25' }],
  },
  {
    id: '12345-1234567-3',
    fullName: 'Rohan Kumar',
    fatherName: 'Anil Kumar',
    cnic: '12345-1234567-3',
    password: 'password',
    mobileNumber: '0300-3456789',
    email: 'rohan.kumar@example.com',
    photo: 'https://placehold.co/100x100.png',
    department: 'Operations',
    designation: 'Labourer',
    bps: 'BPS-02',
    education: 'Matric',
    station: 'Labour Colony',
    employmentType: 'Daily-wage',
    dateOfAppointment: '2023-01-10',
    dateOfBirth: '1998-12-05',
    transferHistory: [],
    status: 'Active',
    trainings: [{ name: 'Safety at Work', date: '2023-02-15' }],
    certificates: [],
  },
  {
    id: '12345-1234567-4',
    fullName: 'Priya Singh',
    fatherName: 'Vikram Singh',
    cnic: '12345-1234567-4',
    password: 'password',
    mobileNumber: '0300-4567890',
    email: 'priya.singh@example.com',
    photo: 'https://placehold.co/100x100.png',
    department: 'Finance',
    designation: 'Accountant',
    bps: 'BPS-16',
    education: 'B.Com',
    station: 'Head Office',
    employmentType: 'Permanent',
    dateOfAppointment: '2020-11-30',
    dateOfBirth: '1992-06-25',
    transferHistory: [],
    status: 'Active',
    trainings: [],
    certificates: [],
  },
  {
    id: '12345-1234567-5',
    fullName: 'Amit Kumar',
    fatherName: 'Sunil Kumar',
    cnic: '12345-1234567-5',
    password: 'password',
    mobileNumber: '0300-5678901',
    email: 'amit.kumar@example.com',
    photo: 'https://placehold.co/100x100.png',
    department: 'Marketing',
    designation: 'Marketing Executive',
    bps: 'BPS-16',
    education: 'MBA in Marketing',
    station: 'Zonal Office',
    employmentType: 'Contract',
    dateOfAppointment: '2023-03-01',
    dateOfBirth: '1996-04-12',
    transferHistory: [],
    status: 'Active',
    trainings: [],
    certificates: [],
  },
  {
    id: '12345-1234567-6',
    fullName: 'Sunita Devi',
    fatherName: 'Rajesh Devi',
    cnic: '12345-1234567-6',
    password: 'password',
    mobileNumber: '0300-6789012',
    email: 'sunita.devi@example.com',
    photo: 'https://placehold.co/100x100.png',
    department: 'Operations',
    designation: 'Supervisor',
    bps: 'BPS-14',
    education: 'Intermediate',
    station: 'Labour Colony',
    employmentType: 'Permanent',
    dateOfAppointment: '2019-07-22',
    dateOfBirth: '1988-11-30',
    transferHistory: [
      { station: 'Colony 5', fromDate: '2021-01-01', toDate: '2022-12-31' },
    ],
    status: 'Active',
    trainings: [],
    certificates: [],
  },
  {
    id: '12345-1234567-7',
    fullName: 'Vikram Rathod',
    fatherName: 'Sanjay Rathod',
    cnic: '12345-1234567-7',
    password: 'password',
    mobileNumber: '0300-7890123',
    email: 'vikram.rathod@example.com',
    photo: 'https://placehold.co/100x100.png',
    department: 'Technology',
    designation: 'System Analyst',
    bps: 'BPS-17',
    education: 'B.E. in IT',
    station: 'Head Office',
    employmentType: 'Permanent',
    dateOfAppointment: '2022-09-01',
    dateOfBirth: '1993-01-15',
    transferHistory: [],
    status: 'Inactive',
    trainings: [],
    certificates: [],
  },
  {
    id: '12345-1234567-8',
    fullName: 'Anjali Verma',
    fatherName: 'Ravi Verma',
    cnic: '12345-1234567-8',
    password: 'password',
    mobileNumber: '0300-8901234',
    email: 'anjali.verma@example.com',
    photo: 'https://placehold.co/100x100.png',
    department: 'Human Resources',
    designation: 'HR Assistant',
    bps: 'BPS-15',
    education: 'BBA in HR',
    station: 'Zonal Office',
    employmentType: 'Contract',
    dateOfAppointment: '2023-06-12',
    dateOfBirth: '1997-07-07',
    transferHistory: [],
    status: 'Active',
    trainings: [],
    certificates: [],
  },
  {
    id: '12345-1234567-9',
    fullName: 'Manoj Yadav',
    fatherName: 'Dinesh Yadav',
    cnic: '12345-1234567-9',
    password: 'password',
    mobileNumber: '0300-9012345',
    email: 'manoj.yadav@example.com',
    photo: 'https://placehold.co/100x100.png',
    department: 'Operations',
    designation: 'Labourer',
    bps: 'BPS-02',
    education: 'Middle',
    station: 'Labour Colony',
    employmentType: 'Daily-wage',
    dateOfAppointment: '2023-02-18',
    dateOfBirth: '2000-03-22',
    transferHistory: [],
    status: 'Active',
    trainings: [],
    certificates: [],
  },
  {
    id: '23456-2345678-0',
    fullName: 'Sneha Reddy',
    fatherName: 'Arjun Reddy',
    cnic: '23456-2345678-0',
    password: 'password',
    mobileNumber: '0301-1234567',
    email: 'sneha.reddy@example.com',
    photo: 'https://placehold.co/100x100.png',
    department: 'Finance',
    designation: 'Senior Accountant',
    bps: 'BPS-18',
    education: 'M.Com',
    station: 'Head Office',
    employmentType: 'Permanent',
    dateOfAppointment: '2018-04-16',
    dateOfBirth: '1991-09-18',
    transferHistory: [],
    status: 'Active',
    trainings: [],
    certificates: [],
  },
    {
    id: '23456-2345678-1',
    fullName: 'Kavita Gupta',
    fatherName: 'Ashok Gupta',
    cnic: '23456-2345678-1',
    password: 'password',
    mobileNumber: '0301-2345678',
    email: 'kavita.gupta@example.com',
    photo: 'https://placehold.co/100x100.png',
    department: 'Technology',
    designation: 'UI/UX Designer',
    bps: 'BPS-17',
    education: 'B.Design',
    station: 'Head Office',
    employmentType: 'Permanent',
    dateOfAppointment: '2022-11-10',
    dateOfBirth: '1994-10-28',
    transferHistory: [],
    status: 'Active',
    trainings: [],
    certificates: [],
  },
  {
    id: '23456-2345678-2',
    fullName: 'Rajesh Mehra',
    fatherName: 'Vijay Mehra',
    cnic: '23456-2345678-2',
    password: 'password',
    mobileNumber: '0301-3456789',
    email: 'rajesh.mehra@example.com',
    photo: 'https://placehold.co/100x100.png',
    department: 'Operations',
    designation: 'Zonal Manager',
    bps: 'BPS-19',
    education: 'M.A. Public Administration',
    station: 'Zonal Office',
    employmentType: 'Permanent',
    dateOfAppointment: '2017-09-05',
    dateOfBirth: '1985-05-14',
    transferHistory: [],
    status: 'Active',
    trainings: [],
    certificates: [],
  },
  {
    id: '23456-2345678-3',
    fullName: 'Suresh Ram',
    fatherName: 'Gopal Ram',
    cnic: '23456-2345678-3',
    password: 'password',
    mobileNumber: '0301-4567890',
    email: 'suresh.ram@example.com',
    photo: 'https://placehold.co/100x100.png',
    department: 'Operations',
    designation: 'Labourer',
    bps: 'BPS-01',
    education: 'Primary',
    station: 'Labour Colony',
    employmentType: 'Daily-wage',
    dateOfAppointment: '2023-04-02',
    dateOfBirth: '1999-01-01',
    transferHistory: [],
    status: 'Inactive',
    trainings: [],
    certificates: [],
  },
  {
    id: '23456-2345678-4',
    fullName: 'Neha Desai',
    fatherName: 'Mahesh Desai',
    cnic: '23456-2345678-4',
    password: 'password',
    mobileNumber: '0301-5678901',
    email: 'neha.desai@example.com',
    photo: 'https://placehold.co/100x100.png',
    department: 'Marketing',
    designation: 'Digital Marketer',
    bps: 'BPS-16',
    education: 'B.Sc. Media Sciences',
    station: 'Zonal Office',
    employmentType: 'Contract',
    dateOfAppointment: '2022-08-20',
    dateOfBirth: '1996-08-20',
    transferHistory: [],
    status: 'Active',
    trainings: [],
    certificates: [],
  },
  {
    id: '23456-2345678-5',
    fullName: 'Arjun Singh',
    fatherName: 'Ranbir Singh',
    cnic: '23456-2345678-5',
    password: 'password',
    mobileNumber: '0301-6789012',
    email: 'arjun.singh@example.com',
    photo: 'https://placehold.co/100x100.png',
    department: 'Technology',
    designation: 'DevOps Engineer',
    bps: 'BPS-17',
    education: 'B.S. Software Engineering',
    station: 'Head Office',
    employmentType: 'Permanent',
    dateOfAppointment: '2021-12-01',
    dateOfBirth: '1992-03-03',
    transferHistory: [],
    status: 'Active',
    trainings: [],
    certificates: [],
  },
];


export const leaveRequests: LeaveRequest[] = [
    { id: 'LVE001', employeeId: '12345-1234567-1', leaveType: 'Annual Leave', fromDate: '2024-07-29', toDate: '2024-07-30', status: 'Pending', statusHistory: [{ status: 'Pending', timestamp: new Date().toISOString() }] },
    { id: 'LVE002', employeeId: '12345-1234567-5', leaveType: 'Sick Leave', fromDate: '2024-07-28', toDate: '2024-07-28', status: 'Pending', statusHistory: [{ status: 'Pending', timestamp: new Date().toISOString() }] },
    { id: 'LVE003', employeeId: '12345-1234567-6', leaveType: 'Casual Leave', fromDate: '2024-08-01', toDate: '2024-08-02', status: 'Approved', statusHistory: [{ status: 'Pending', timestamp: new Date().toISOString() }, { status: 'Approved', timestamp: new Date().toISOString() }] },
    { id: 'LVE004', employeeId: '12345-1234567-2', leaveType: 'Annual Leave', fromDate: '2024-08-05', toDate: '2024-08-07', status: 'Rejected', statusHistory: [{ status: 'Pending', timestamp: new Date().toISOString() }, { status: 'Rejected', timestamp: new Date().toISOString() }] },
];


export const leavePolicies: LeavePolicy[] = [
    { id: 'LPOL001', type: 'Annual Leave', balance: 12 },
    { id: 'LPOL002', type: 'Sick Leave', balance: 8 },
    { id: 'LPOL003', type: 'Casual Leave', balance: 5 },
    { id: 'LPOL004', type: 'Unpaid Leave', balance: 0 },
];
