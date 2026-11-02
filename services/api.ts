import axios, {
  type InternalAxiosRequestConfig,
} from 'axios';
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

export type UpdateEmployeeInput =
  Partial<CreateEmployeeInput>;

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

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retryCount?: number;
  _authRetry?: boolean;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* =========================================================
   SESSION EXPIRY HANDLER
========================================================= */

let refreshPromise: Promise<string> | null = null;

let sessionExpiredHandler:
  | (() => void | Promise<void>)
  | null = null;

export function registerSessionExpiredHandler(
  handler: () => void | Promise<void>,
): () => void {
  sessionExpiredHandler = handler;

  return () => {
    if (sessionExpiredHandler === handler) {
      sessionExpiredHandler = null;
    }
  };
}

/* =========================================================
   LOCAL STORAGE HELPERS
========================================================= */

async function readSavedEmployees(): Promise<Employee[] | null> {
  const saved = await AsyncStorage.getItem(
    EMPLOYEE_STORAGE_KEY,
  );

  if (saved === null) {
    return null;
  }

  try {
    const employees: unknown = JSON.parse(saved);

    return Array.isArray(employees)
      ? (employees as Employee[])
      : null;
  } catch {
    return null;
  }
}

async function saveEmployees(
  employees: Employee[],
): Promise<void> {
  await AsyncStorage.setItem(
    EMPLOYEE_STORAGE_KEY,
    JSON.stringify(employees),
  );
}

async function readPendingActions(): Promise<PendingAction[]> {
  const saved = await AsyncStorage.getItem(
    PENDING_ACTIONS_KEY,
  );

  if (!saved) {
    return [];
  }

  try {
    const actions: unknown = JSON.parse(saved);

    return Array.isArray(actions)
      ? (actions as PendingAction[])
      : [];
  } catch {
    return [];
  }
}

async function savePendingActions(
  actions: PendingAction[],
): Promise<void> {
  await AsyncStorage.setItem(
    PENDING_ACTIONS_KEY,
    JSON.stringify(actions),
  );
}

async function addPendingAction(
  action: PendingAction,
): Promise<void> {
  const actions = await readPendingActions();

  actions.push(action);

  await savePendingActions(actions);
}

function createActionId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function isNetworkOrServerUnavailable(
  error: unknown,
): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  return (
    !error.response ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ERR_NETWORK' ||
    error.code === 'ETIMEDOUT'
  );
}

/* =========================================================
   REFRESH ACCESS TOKEN
========================================================= */

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = await AsyncStorage.getItem(
    REFRESH_TOKEN_KEY,
  );

  if (!refreshToken) {
    throw new Error('No refresh token available.');
  }

  // Use plain axios, not the intercepted api instance.
  // This prevents recursive refresh requests on a 401.
  const response = await axios.post<{
    accessToken?: string;
    refreshToken?: string;
  }>(
    `${API_BASE_URL}/auth/refresh`,
    {
      refreshToken,
      expiresInMins: 30,
    },
    {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  const newAccessToken = response.data.accessToken;

  if (!newAccessToken) {
    throw new Error(
      'The server did not return a new access token.',
    );
  }

  await AsyncStorage.setItem(
    TOKEN_KEY,
    newAccessToken,
  );

  if (response.data.refreshToken) {
    await AsyncStorage.setItem(
      REFRESH_TOKEN_KEY,
      response.data.refreshToken,
    );
  }

  return newAccessToken;
}

/* =========================================================
   REQUEST INTERCEPTOR
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

/* =========================================================
   RESPONSE INTERCEPTOR
   - Automatic token refresh
   - Retry original request once
   - Preserve GET retry behavior
========================================================= */

api.interceptors.response.use(
  response => response,

  async error => {
    const config =
      error.config as RetryableRequestConfig | undefined;

    if (!config) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      const requestUrl = config.url?.toLowerCase() ?? '';

      // Do not refresh for login/refresh requests.
      if (
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/refresh') ||
        config._authRetry
      ) {
        return Promise.reject(error);
      }

      config._authRetry = true;

      try {
        // Concurrent 401 requests share the same refresh.
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken()
            .catch(async refreshError => {
              await AsyncStorage.multiRemove([
                TOKEN_KEY,
                REFRESH_TOKEN_KEY,
              ]);

              if (sessionExpiredHandler) {
                await sessionExpiredHandler();
              }

              throw refreshError;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;

        config.headers.Authorization = `Bearer ${newToken}`;

        // Retry this original request only once.
        return api.request(config);
      } catch {
        return Promise.reject(error);
      }
    }

    // Preserve the existing GET retry logic.
    const retryCount = config._retryCount ?? 0;
    const method = config.method?.toLowerCase();

    const isNetworkOrTimeoutError =
      !error.response ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT';

    const isRetryableStatus = [
      408,
      429,
      500,
      502,
      503,
      504,
    ].includes(error.response?.status);

    if (
      method === 'get' &&
      retryCount < 2 &&
      (isNetworkOrTimeoutError || isRetryableStatus)
    ) {
      config._retryCount = retryCount + 1;

      await new Promise(resolve =>
        setTimeout(
          resolve,
          1000 * config._retryCount!,
        ),
      );

      return api.request(config);
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
  const response = await api.post<AuthResponse>(
    '/auth/login',
    {
      username,
      password,
      expiresInMins: 30,
    },
  );

  return response.data;
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
    const response = await api.get<EmployeesResponse>(
      '/users',
      {
        params: { limit, skip },
      },
    );

    const freshEmployees = response.data.users;
    const employeeMap = new Map<number, Employee>();

    (savedEmployees ?? []).forEach(employee => {
      employeeMap.set(employee.id, employee);
    });

    freshEmployees.forEach(employee => {
      employeeMap.set(employee.id, employee);
    });

    const mergedEmployees = Array.from(
      employeeMap.values(),
    );

    await saveEmployees(mergedEmployees);

    return {
      ...response.data,
      users: mergedEmployees.slice(skip, skip + limit),
      total: Math.max(
        response.data.total,
        mergedEmployees.length,
      ),
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

export async function getEmployee(
  id: number,
): Promise<Employee> {
  const savedEmployees = await readSavedEmployees();

  const savedEmployee = savedEmployees?.find(
    employee => employee.id === id,
  );

  if (savedEmployee) {
    return savedEmployee;
  }

  const response = await api.get<Employee>(
    `/users/${id}`,
  );

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
    const response = await api.post<Employee>(
      '/users/add',
      employee,
    );

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

  const savedEmployees =
    (await readSavedEmployees()) ?? [];

  await saveEmployees([
    createdEmployee,
    ...savedEmployees.filter(
      item => item.id !== createdEmployee.id,
    ),
  ]);

  if (!requestSucceeded) {
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

export async function deleteEmployee(
  id: number,
): Promise<Employee> {
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

  // Update local UI immediately.
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

async function syncPendingActionsInternal(): Promise<{
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

  // Preserve queue order. If one action fails, retain it and
  // all subsequent actions for the next sync attempt.
  for (
    let index = 0;
    index < actions.length;
    index += 1
  ) {
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

        // Update later actions that refer to the temporary ID.
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
      } else {
        await api.delete<Employee>(
          `/users/${action.employeeId}`,
        );
      }

      synced += 1;
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
let syncPromise: Promise<{ synced: number; pending: number }> | null =
null;

export function syncPendingActions(): Promise<{
synced: number;
pending: number;
}> {
if (syncPromise) {
return syncPromise;
}

syncPromise = syncPendingActionsInternal().finally(() => {
syncPromise = null;
});

return syncPromise;
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

export function getApiErrorMessage(
  error: unknown,
): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'Your session has expired. Please login again.';
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT'
    ) {
      return 'Request timed out. Please try again.';
    }

    if (!error.response) {
      return 'Network error. Please check your internet connection.';
    }

    if (error.response.status >= 500) {
      return 'The server is temporarily unavailable. Please try again.';
    }

    return `Request failed with status ${error.response.status}.`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}