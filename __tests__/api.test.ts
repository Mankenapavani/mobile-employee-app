import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import axios from 'axios';
import {
  getApiErrorMessage,
} from '../services/api';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    })),
    isAxiosError: jest.fn(),
  },
}));

const mockedIsAxiosError = axios.isAxiosError as unknown as jest.Mock;

describe('getApiErrorMessage', () => {
  beforeEach(() => {
    mockedIsAxiosError.mockReset();
  });

  it('returns the session-expired message for HTTP 401', () => {
    mockedIsAxiosError.mockReturnValue(true);

    const error = {
      response: {
        status: 401,
      },
    };

    expect(getApiErrorMessage(error)).toBe(
      'Your session has expired. Please login again.',
    );
  });

  it('returns a timeout message for timed-out requests', () => {
    mockedIsAxiosError.mockReturnValue(true);

    const error = {
      code: 'ECONNABORTED',
    };

    expect(getApiErrorMessage(error)).toBe(
      'Request timed out. Please try again.',
    );
  });

  it('returns a network message when there is no response', () => {
    mockedIsAxiosError.mockReturnValue(true);

    expect(
      getApiErrorMessage({ request: {} }),
    ).toBe(
      'Network error. Please check your internet connection.',
    );
  });

  it('returns the API error message when available', () => {
    mockedIsAxiosError.mockReturnValue(true);

    expect(
      getApiErrorMessage({
        response: {
          status: 400,
          data: {
            message: 'Invalid credentials',
          },
        },
      }),
    ).toBe('Invalid credentials');
  });

  it('returns a normal Error message', () => {
    mockedIsAxiosError.mockReturnValue(false);

    expect(
      getApiErrorMessage(new Error('Something failed')),
    ).toBe('Something failed');
  });

  it('returns a fallback message for unknown errors', () => {
    mockedIsAxiosError.mockReturnValue(false);

    expect(getApiErrorMessage('unknown')).toBe(
      'Something went wrong. Please try again.',
    );
  });
});
