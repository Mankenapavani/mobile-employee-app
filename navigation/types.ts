export type Employee = {
id: number;
name: string;
email: string;
phone: string;
department: string;
designation: string;
};

export type RootStackParamList = {
Login: undefined;
Home: undefined;
EmployeeList: {
change?: {
type: 'add' | 'update';
employee: Employee;
};
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