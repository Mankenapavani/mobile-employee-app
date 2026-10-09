import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

type User = {
  firstName?: string;
  lastName?: string;
  username?: string;
};

type AuthResponse = {
  accessToken?: string;
  token?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

const TOKEN_KEY = '@employee_hub_token';
const USER_KEY = '@employee_hub_user';

const API_BASE_URL = 'https://dummyjson.com';

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    const restoreSession =
      async () => {
        try {
          const storedToken =
            await AsyncStorage.getItem(
              TOKEN_KEY
            );

          const storedUser =
            await AsyncStorage.getItem(
              USER_KEY
            );

          if (storedToken) {
            setToken(storedToken);
          }

          if (storedUser) {
            setUser(
              JSON.parse(storedUser)
            );
          }
        } catch (error) {
          console.error(
            'Failed to restore session:',
            error
          );
        } finally {
          setIsLoading(false);
        }
      };

    restoreSession();
  }, []);

  const login = useCallback(
    async (
      username: string,
      password: string
    ) => {
      const response =
        await axios.post<AuthResponse>(
          `${API_BASE_URL}/auth/login`,
          {
            username,
            password,
            expiresInMins: 30,
          }
        );

      const authToken =
        response.data.accessToken ||
        response.data.token;

      if (!authToken) {
        throw new Error(
          'Authentication token was not returned.'
        );
      }

      const loggedInUser: User = {
        firstName:
          response.data.firstName,
        lastName:
          response.data.lastName,
        username:
          response.data.username ||
          username,
      };

      await AsyncStorage.setItem(
        TOKEN_KEY,
        authToken
      );

      await AsyncStorage.setItem(
        USER_KEY,
        JSON.stringify(loggedInUser)
      );

      setToken(authToken);
      setUser(loggedInUser);
    },
    []
  );

  const logout = useCallback(
    async () => {
      try {
        await AsyncStorage.removeItem(
          TOKEN_KEY
        );

        await AsyncStorage.removeItem(
          USER_KEY
        );
      } finally {
        setToken(null);
        setUser(null);
      }
    },
    []
  );

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated:
      Boolean(token),
    login,
    logout,
  };

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}