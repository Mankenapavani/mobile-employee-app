import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://dummyjson.com';

const TOKEN_KEY = '@employee_hub_token';
const REFRESH_TOKEN_KEY = '@employee_hub_refresh_token';
const EMPLOYEE_STORAGE_KEY = '@employee_hub_employees';
const PENDING_ACTIONS_KEY = '@employee_hub_pending_actions';

export type Employee = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  username?: string;
  role?: string;
  company?: {
    department?: string;
    title?: string;
  };
};

export type EmployeesResponse = {
  users: Employee[];
  total: number;
  skip: number;
  limit: number;
};

export type CreateEmployeeInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: {
    department?: string;
    title?: string;
  };
};

export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;

export type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
};

type PendingAction =
  | {
      id: string;
      type: 'create';
      localEmployeeId: number;
      data: CreateEmployeeInput;
      createdAt: number;
    }
  | {
      id: string;
      type: 'update';
      employeeId: number;
      data: UpdateEmployeeInput;
      createdAt: number;
    }
  | {
      id: string;
      type: 'delete';
      employeeId: number;
      createdAt: number;
    };

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* =========================================================
   LOCAL STORAGE HELPERS
========================================================= */

async function readSavedEmployees(): Promise<Employee[] | null> {
  const saved = await AsyncStorage.getItem(EMPLOYEE_STORAGE_KEY);

  if (saved === null) {
    return null;
  }

  try {
    const employees: unknown = JSON.parse(saved);
    return Array.isArray(employees) ? (employees as Employee[]) : null;
  } catch {
    return null;
  }
}

async function saveEmployees(employees: Employee[]): Promise<void> {
  await AsyncStorage.setItem(
    EMPLOYEE_STORAGE_KEY,
    JSON.stringify(employees),
  );
}

async function readPendingActions(): Promise<PendingAction[]> {
  const saved = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);

  if (!saved) {
    return [];
  }

  try {
    const actions: unknown = JSON.parse(saved);
    return Array.isArray(actions) ? (actions as PendingAction[]) : [];
  } catch {
    return [];
  }
}

async function savePendingActions(actions: PendingAction[]): Promise<void> {
  await AsyncStorage.setItem(
    PENDING_ACTIONS_KEY,
    JSON.stringify(actions),
  );
}

async function addPendingAction(action: PendingAction): Promise<void> {
  const actions = await readPendingActions();
  actions.push(action);
  await savePendingActions(actions);
}

function createActionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isNetworkOrServerUnavailable(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  return (
    !error.response ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ERR_NETWORK'
  );
}

/* =========================================================
   REQUEST / RESPONSE INTERCEPTORS
========================================================= */

api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      console.log(
        '401 Unauthorized - authentication may have expired.',
      );
    }

    return Promise.reject(error);
  },
);

/* =========================================================
   LOGIN
========================================================= */

export async function login(
  username: string,
  password: string,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', {
    username,
    password,
    expiresInMins: 30,
  });

  return response.data;
}

/* =========================================================
   REFRESH TOKEN
========================================================= */

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

  if (!refreshToken) {
    throw new Error('No refresh token available.');
  }

  const response = await api.post<{
    accessToken: string;
    refreshToken?: string;
  }>('/auth/refresh', {
    refreshToken,
    expiresInMins: 30,
  });

  const newAccessToken = response.data.accessToken;

  await AsyncStorage.setItem(TOKEN_KEY, newAccessToken);

  if (response.data.refreshToken) {
    await AsyncStorage.setItem(
      REFRESH_TOKEN_KEY,
      response.data.refreshToken,
    );
  }

  return newAccessToken;
}

/* =========================================================
   GET EMPLOYEES
========================================================= */

export async function getEmployees(
  limit = 10,
  skip = 0,
): Promise<EmployeesResponse> {
  const savedEmployees = await readSavedEmployees();

  try {
    const response = await api.get<EmployeesResponse>('/users', {
      params: { limit, skip },
    });

    const freshEmployees = response.data.users;
    const employeeMap = new Map<number, Employee>();

    (savedEmployees ?? []).forEach(employee => {
      employeeMap.set(employee.id, employee);
    });

    freshEmployees.forEach(employee => {
      employeeMap.set(employee.id, employee);
    });

    const mergedEmployees = Array.from(employeeMap.values());

    await saveEmployees(mergedEmployees);

    return {
      ...response.data,
      users: mergedEmployees.slice(skip, skip + limit),
      total: Math.max(response.data.total, mergedEmployees.length),
    };
  } catch (error) {
    if (savedEmployees !== null) {
      return {
        users: savedEmployees.slice(skip, skip + limit),
        total: savedEmployees.length,
        skip,
        limit,
      };
    }

    throw error;
  }
}

/* =========================================================
   GET SINGLE EMPLOYEE
========================================================= */

export async function getEmployee(id: number): Promise<Employee> {
  const savedEmployees = await readSavedEmployees();

  const savedEmployee = savedEmployees?.find(
    employee => employee.id === id,
  );

  if (savedEmployee) {
    return savedEmployee;
  }

  const response = await api.get<Employee>(`/users/${id}`);

  return response.data;
}

/* =========================================================
   ADD EMPLOYEE
========================================================= */

export async function createEmployee(
  employee: CreateEmployeeInput,
): Promise<Employee> {
  let createdEmployee: Employee;
  let requestSucceeded = false;

  try {
    const response = await api.post<Employee>('/users/add', employee);

    createdEmployee = {
      ...employee,
      ...response.data,
      company: {
        ...employee.company,
        ...response.data.company,
      },
    };

    requestSucceeded = true;
  } catch (error) {
    if (!isNetworkOrServerUnavailable(error)) {
      throw error;
    }

    createdEmployee = {
      ...employee,
      id: Date.now(),
    };
  }

  const savedEmployees = (await readSavedEmployees()) ?? [];

  await saveEmployees([
    createdEmployee,
    ...savedEmployees.filter(
      item => item.id !== createdEmployee.id,
    ),
  ]);

  if (!requestSucceeded) {
    console.log('Offline employee queued:', createdEmployee.id);
    await addPendingAction({
      id: createActionId(),
      type: 'create',
      localEmployeeId: createdEmployee.id,
      data: employee,
      createdAt: Date.now(),
    });
  }

  return createdEmployee;
}

/* =========================================================
   UPDATE EMPLOYEE
========================================================= */

export async function updateEmployee(
  id: number,
  employee: UpdateEmployeeInput,
): Promise<Employee> {
  const savedEmployees = await readSavedEmployees();

  if (savedEmployees === null) {
    throw new Error(
      'Employee list is not loaded. Please open the employee list first.',
    );
  }

  const existingEmployee = savedEmployees.find(
    item => item.id === id,
  );

  if (!existingEmployee) {
    throw new Error('Employee not found.');
  }

  let apiEmployee: Partial<Employee> = {};
  let requestSucceeded = false;

  try {
    const response = await api.put<Employee>(
      `/users/${id}`,
      employee,
    );

    apiEmployee = response.data;
    requestSucceeded = true;
  } catch (error) {
    if (!isNetworkOrServerUnavailable(error)) {
      throw error;
    }
  }

  const updatedEmployee: Employee = {
    ...existingEmployee,
    ...apiEmployee,
    ...employee,
    id,
    company: {
      ...existingEmployee.company,
      ...apiEmployee.company,
      ...employee.company,
    },
  };

  await saveEmployees(
    savedEmployees.map(item =>
      item.id === id ? updatedEmployee : item,
    ),
  );

  if (!requestSucceeded) {
    await addPendingAction({
      id: createActionId(),
      type: 'update',
      employeeId: id,
      data: employee,
      createdAt: Date.now(),
    });
  }

  return updatedEmployee;
}

/* =========================================================
   DELETE EMPLOYEE
========================================================= */

export async function deleteEmployee(id: number): Promise<Employee> {
  const savedEmployees = await readSavedEmployees();

  if (savedEmployees === null) {
    throw new Error(
      'Employee list is not loaded. Please open the employee list first.',
    );
  }

  const employeeToDelete = savedEmployees.find(
    item => item.id === id,
  );

  if (!employeeToDelete) {
    throw new Error('Employee not found.');
  }

  await saveEmployees(
    savedEmployees.filter(item => item.id !== id),
  );

  try {
    await api.delete<Employee>(`/users/${id}`);
  } catch (error) {
    if (!isNetworkOrServerUnavailable(error)) {
      await saveEmployees(savedEmployees);
      throw error;
    }

    await addPendingAction({
      id: createActionId(),
      type: 'delete',
      employeeId: id,
      createdAt: Date.now(),
    });
  }

  return employeeToDelete;
}

/* =========================================================
   SYNC PENDING OFFLINE ACTIONS
========================================================= */

export async function syncPendingActions(): Promise<{
  synced: number;
  pending: number;
}> {
  const actions = await readPendingActions();

  if (actions.length === 0) {
    return { synced: 0, pending: 0 };
  }

  let synced = 0;
  let employees = (await readSavedEmployees()) ?? [];
  const remaining: PendingAction[] = [];

  for (let index = 0; index < actions.length; index += 1) {
    const action = actions[index];

    try {
      if (action.type === 'create') {
        const response = await api.post<Employee>(
          '/users/add',
          action.data,
        );

        const serverEmployee: Employee = {
          ...action.data,
          ...response.data,
          company: {
            ...action.data.company,
            ...response.data.company,
          },
        };

        employees = employees.map(item =>
          item.id === action.localEmployeeId
            ? serverEmployee
            : item,
        );

        for (
          let laterIndex = index + 1;
          laterIndex < actions.length;
          laterIndex += 1
        ) {
          const laterAction = actions[laterIndex];

          if (
            (laterAction.type === 'update' ||
              laterAction.type === 'delete') &&
            laterAction.employeeId === action.localEmployeeId
          ) {
            actions[laterIndex] = {
              ...laterAction,
              employeeId: serverEmployee.id,
            };
          }
        }

        synced += 1;
        continue;
      }

      if (action.type === 'update') {
        await api.put<Employee>(
          `/users/${action.employeeId}`,
          action.data,
        );

        synced += 1;
      } else {
        await api.delete<Employee>(
          `/users/${action.employeeId}`,
        );

        synced += 1;
      }
    } catch {
      remaining.push(...actions.slice(index));
      break;
    }
  }

  await saveEmployees(employees);
  await savePendingActions(remaining);

  return {
    synced,
    pending: remaining.length,
  };
}

/* =========================================================
   GET PENDING ACTION COUNT
========================================================= */

export async function getPendingActionCount(): Promise<number> {
  const actions = await readPendingActions();

  return actions.length;
}

/* =========================================================
   ERROR HANDLING
========================================================= */

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'Your session has expired. Please login again.';
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }

    if (!error.response) {
      return 'Network error. Please check your internet connection.';
    }

    return `Request failed with status ${error.response.status}.`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}