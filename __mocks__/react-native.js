// Minimal react-native mock for Node/Jest unit tests
// Only stubs what the tested utilities actually import.
module.exports = {
  Linking: {
    canOpenURL: jest.fn(),
    openURL: jest.fn(),
  },
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  Platform: {
    OS: "ios",
    select: jest.fn((obj) => obj.ios ?? obj.default),
  },
};
