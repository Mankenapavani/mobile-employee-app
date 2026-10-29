
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export type User = {
  firstName?: string;
  lastName?: string;
  username?: string;
};

type AuthResponse = {
  accessToken?: string;
  refreshToken?: string;
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
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@employee_hub_token';
const REFRESH_TOKEN_KEY = '@employee_hub_refresh_token';
const USER_KEY = '@employee_hub_user';

const API_BASE_URL = 'https://dummyjson.com';

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore saved login session when the app starts.
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);

        if (storedToken) {
          setToken(storedToken);
        }

        if (storedUser) {
          setUser(JSON.parse(storedUser) as User);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, []);

  // Login using the authentication API.
  const login = useCallback(
    async (username: string, password: string) => {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/login`,
        {
          username,
          password,
          expiresInMins: 30,
        },
      );

      const authToken =
        response.data.accessToken || response.data.token;

      if (!authToken) {
        throw new Error('Authentication token was not returned.');
      }

      const loggedInUser: User = {
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        username: response.data.username || username,
      };

      await AsyncStorage.setItem(TOKEN_KEY, authToken);

      if (response.data.refreshToken) {
        await AsyncStorage.setItem(
          REFRESH_TOKEN_KEY,
          response.data.refreshToken,
        );
      } else {
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      }

      await AsyncStorage.setItem(
        USER_KEY,
        JSON.stringify(loggedInUser),
      );

      setToken(authToken);
      setUser(loggedInUser);
    },
    [],
  );

  // Update the user profile and persist it locally.
  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      const updatedUser: User = {
        ...user,
        ...updates,
      };

      await AsyncStorage.setItem(
        USER_KEY,
        JSON.stringify(updatedUser),
      );

      setUser(updatedUser);
    },
    [user],
  );

  // Clear the saved session and reset authentication state.
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_KEY,
      ]);
    } finally {
      setToken(null);
      setUser(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(token),
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
