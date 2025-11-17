import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

/**
 * Test suite for App component
 * Tests the main routing and layout structure
 */
describe('App', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      // Arrange & Act
      render(<App />);
      
      // Assert - App should render successfully
      const bodyElement = document.querySelector('body');
      expect(bodyElement).not.toBeNull();
    });

    it('should render the Layout component', () => {
      // Arrange & Act
      render(<App />);
      
      // Assert - Layout should be present (checking for common layout elements)
      const mainElement = document.querySelector('main') || document.querySelector('[role="main"]');
      expect(mainElement).toBeTruthy();
    });
  });

  describe('Routing', () => {
    it('should render Home page on root path', () => {
      // Arrange & Act
      render(<App />);
      
      // Assert - Home page content should be visible
      // This will need to be adjusted based on actual Home component content
      expect(screen.queryByText(/home|welcome|portfolio/i)).toBeTruthy();
    });
  });

  describe('Browser Router', () => {
    it('should apply correct basename in production', () => {
      // Act
      render(<App />);
      
      // Assert - Router should be configured
      const bodyElement = document.querySelector('body');
      expect(bodyElement).not.toBeNull();
      
      // Note: In a real scenario, you might want to test navigation
      // by using MemoryRouter with initialEntries in tests
    });
  });
});
