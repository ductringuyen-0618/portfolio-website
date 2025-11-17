/**
 * Common test utilities and helpers
 * 
 * This file contains reusable test utilities, mock data generators,
 * and helper functions for writing tests following enterprise standards.
 */

import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Custom render function that includes common providers
 * 
 * @param ui - React component to render
 * @param options - Render options
 * @returns Render result from testing-library
 * 
 * @example
 * ```typescript
 * const { getByText } = renderWithRouter(<MyComponent />);
 * ```
 */
export function renderWithRouter(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
    ...options,
  });
}

/**
 * Mock user type for testing
 */
interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Creates a mock user object for testing
 * 
 * @param overrides - Optional properties to override defaults
 * @returns Mock user object
 * 
 * @example
 * ```typescript
 * const user = createMockUser({ name: 'John Doe' });
 * ```
 */
export function createMockUser(overrides?: Partial<MockUser>) {
  return {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Waits for async operations to complete
 * Useful for testing async state updates
 * 
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after delay
 * 
 * @example
 * ```typescript
 * await waitFor(100);
 * ```
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a mock API response
 * 
 * @param data - Response data
 * @param options - Response options (status, headers, etc.)
 * @returns Mock Response object
 * 
 * @example
 * ```typescript
 * const response = createMockResponse({ data: 'test' });
 * ```
 */
export function createMockResponse<T>(
  data: T,
  options: { status?: number; statusText?: string } = {}
): Response {
  const { status = 200, statusText = 'OK' } = options;

  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
  } as Response;
}

/**
 * Creates a mock API error response
 * 
 * @param message - Error message
 * @param status - HTTP status code
 * @returns Mock error Response object
 * 
 * @example
 * ```typescript
 * const errorResponse = createMockErrorResponse('Not found', 404);
 * ```
 */
export function createMockErrorResponse(
  message: string,
  status: number = 500
): Response {
  return createMockResponse(
    { error: message },
    { status, statusText: message }
  );
}

/**
 * Mock localStorage for testing
 * 
 * @returns Mock localStorage object with standard methods
 * 
 * @example
 * ```typescript
 * const mockStorage = createMockLocalStorage();
 * Object.defineProperty(window, 'localStorage', { value: mockStorage });
 * ```
 */
export function createMockLocalStorage() {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
}

/**
 * Suppresses console warnings/errors during tests
 * Useful for testing error boundaries or expected errors
 * 
 * @param callback - Test function to run with suppressed console
 * @returns Result of callback
 * 
 * @example
 * ```typescript
 * await suppressConsole(async () => {
 *   // Test code that intentionally triggers console errors
 * });
 * ```
 */
export async function suppressConsole<T>(
  callback: () => T | Promise<T>
): Promise<T> {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = () => {};
  console.warn = () => {};

  try {
    return await callback();
  } finally {
    console.error = originalError;
    console.warn = originalWarn;
  }
}

/**
 * Creates a mock file for upload testing
 * 
 * @param name - File name
 * @param content - File content
 * @param type - MIME type
 * @returns Mock File object
 * 
 * @example
 * ```typescript
 * const file = createMockFile('test.txt', 'Hello', 'text/plain');
 * ```
 */
export function createMockFile(
  name: string,
  content: string,
  type: string = 'text/plain'
): File {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

/**
 * Assertion helpers for common test scenarios
 * Note: Import expect from vitest when using these helpers
 */
export const testHelpers = {
  /**
   * Asserts that an element has specific CSS class
   * @example
   * import { expect } from 'vitest';
   * testHelpers.expectToHaveClass(element, 'active');
   */
  expectToHaveClass: (element: Element, className: string) => {
    return element.classList.contains(className);
  },

  /**
   * Asserts that an element is visible
   */
  expectToBeVisible: (element: Element) => {
    return element !== null && (element as HTMLElement).style.display !== 'none';
  },

  /**
   * Asserts that an array contains specific item
   */
  expectToContainItem: (array: unknown[], item: unknown) => {
    return array.includes(item);
  },
};

/**
 * Re-export commonly used testing utilities
 */
export { screen, fireEvent, waitFor, within } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
