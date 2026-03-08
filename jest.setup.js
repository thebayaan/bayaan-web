import '@testing-library/jest-dom'

// Mock IndexedDB for Dexie if needed
Object.defineProperty(window, 'indexedDB', {
  value: undefined,
  writable: true,
})

// Mock localStorage if needed
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
})