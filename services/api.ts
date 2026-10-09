import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://dummyjson.com';

const TOKEN_KEY = '@employee_hub_token';
const REFRESH_TOKEN_KEY = '@employee_hub_refresh_token';

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

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* =========================================================
   REQUEST INTERCEPTOR
========================================================= */

api.interceptors.request.use(
  async config => {
    const token =
      await AsyncStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */

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
  const response =
    await api.post<AuthResponse>(
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
   REFRESH TOKEN
========================================================= */

export async function refreshAccessToken(): Promise<string> {
  const refreshToken =
    await AsyncStorage.getItem(
      REFRESH_TOKEN_KEY,
    );

  if (!refreshToken) {
    throw new Error(
      'No refresh token available.',
    );
  }

  const response =
    await api.post<{
      accessToken: string;
      refreshToken?: string;
    }>(
      '/auth/refresh',
      {
        refreshToken,
        expiresInMins: 30,
      },
    );

  const newAccessToken =
    response.data.accessToken;

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
   GET EMPLOYEES
========================================================= */

export async function getEmployees(
  limit = 10,
  skip = 0,
): Promise<EmployeesResponse> {
  const response =
    await api.get<EmployeesResponse>(
      '/users',
      {
        params: {
          limit,
          skip,
        },
      },
    );

  return response.data;
}

/* =========================================================
   GET SINGLE EMPLOYEE
========================================================= */

export async function getEmployee(
  id: number,
): Promise<Employee> {
  const response =
    await api.get<Employee>(
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
  const response =
    await api.post<Employee>(
      '/users/add',
      employee,
    );

  return response.data;
}

/* =========================================================
   UPDATE EMPLOYEE
========================================================= */

export async function updateEmployee(
  id: number,
  employee: UpdateEmployeeInput,
): Promise<Employee> {
  const response =
    await api.put<Employee>(
      `/users/${id}`,
      employee,
    );

  return response.data;
}

/* =========================================================
   DELETE EMPLOYEE
========================================================= */

export async function deleteEmployee(
  id: number,
): Promise<Employee> {
  const response =
    await api.delete<Employee>(
      `/users/${id}`,
    );

  return response.data;
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