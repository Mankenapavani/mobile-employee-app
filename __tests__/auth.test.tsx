import React from 'react';
import { Text } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AuthProvider, useAuth } from '../context/AuthContext';


jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

function AuthConsumer() {
  const auth = useAuth();

  return (
    <>
      <Text testID="loading">
        {auth.isLoading ? 'loading' : 'ready'}
      </Text>
      <Text testID="authentication">
        {auth.isAuthenticated ? 'authenticated' : 'unauthenticated'}
      </Text>
      <Text testID="username">{auth.user?.username ?? 'no-user'}</Text>
    </>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);
  });

  it('finishes loading when there is no saved session', async () => {
    const screen = await render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').props.children).toBe('ready');
      expect(screen.getByTestId('authentication').props.children).toBe(
        'unauthenticated',
      );
    });
  });

  it('restores a saved session', async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation(
      async (key: string) => {
        if (key === '@employee_hub_token') return 'saved-token';

        if (key === '@employee_hub_user') {
          return JSON.stringify({ username: 'pavani' });
        }

        return null;
      },
    );

    const screen = await render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('authentication').props.children).toBe(
        'authenticated',
      );
      expect(screen.getByTestId('username').props.children).toBe('pavani');
    });
  });

  it('logs out and clears saved session data', async () => {
    let logout: (() => Promise<void>) | undefined;

    function LogoutConsumer() {
      const auth = useAuth();
      logout = auth.logout;

      return (
        <Text testID="authentication">
          {auth.isAuthenticated ? 'authenticated' : 'unauthenticated'}
        </Text>
      );
    }

    (AsyncStorage.getItem as jest.Mock).mockImplementation(
      async (key: string) => {
        if (key === '@employee_hub_token') return 'saved-token';

        if (key === '@employee_hub_user') {
          return JSON.stringify({ username: 'pavani' });
        }

        return null;
      },
    );

    const screen = await render(
      <AuthProvider>
        <LogoutConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('authentication').props.children).toBe(
        'authenticated',
      );
    });

    await act(async () => {
      await logout?.();
    });

    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
      '@employee_hub_token',
      '@employee_hub_refresh_token',
      '@employee_hub_user',
    ]);

    await waitFor(() => {
      expect(screen.getByTestId('authentication').props.children).toBe(
        'unauthenticated',
      );
    });
  });

  it('saves the token and user after successful login', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        accessToken: 'new-token',
        refreshToken: 'refresh-token',
        firstName: 'Pavani',
        lastName: 'Reddy',
        username: 'pavani',
      },
    });

    let login:
      | ((username: string, password: string) => Promise<void>)
      | undefined;

    function LoginConsumer() {
      const auth = useAuth();
      login = auth.login;

      return (
        <Text testID="authentication">
          {auth.isAuthenticated ? 'authenticated' : 'unauthenticated'}
        </Text>
      );
    }

    await render(
      <AuthProvider>
        <LoginConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(login).toBeDefined();
    });

    await act(async () => {
      await login?.('pavani', 'test-password');
    });

    expect(axios.post).toHaveBeenCalledWith(
      'https://dummyjson.com/auth/login',
      {
        username: 'pavani',
        password: 'test-password',
        expiresInMins: 30,
      },
    );

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@employee_hub_token',
      'new-token',
    );

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@employee_hub_refresh_token',
      'refresh-token',
    );

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@employee_hub_user',
      JSON.stringify({
        firstName: 'Pavani',
        lastName: 'Reddy',
        username: 'pavani',
      }),
    );
  });
});