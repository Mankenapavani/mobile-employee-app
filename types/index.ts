
export interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
}

export interface AppUser {
  id?: number;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  image?: string;
}

export type EmployeeChangeType = 'add' | 'update';

export interface EmployeeChange {
  type: EmployeeChangeType;
  employee: Employee;
}

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  EmployeeList: {
    change?: EmployeeChange;
  } | undefined;
  EmployeeDetails: {
    employee: Employee;
  };
  AddEmployee: undefined;
  EditEmployee: {
    employee: Employee;
  };
  Profile: undefined;
};