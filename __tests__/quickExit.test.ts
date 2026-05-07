import { Linking } from "react-native";
import { quickExit } from "../src/utils/quickExit";

jest.mock("react-native", () => ({
  Linking: {
    canOpenURL: jest.fn(),
    openURL: jest.fn(),
  },
}));

const mockCanOpen = Linking.canOpenURL as jest.Mock;
const mockOpen = Linking.openURL as jest.Mock;

beforeEach(() => {
  jest.useFakeTimers();
  mockCanOpen.mockResolvedValue(true);
  mockOpen.mockResolvedValue(undefined);
});

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

// ─── quickExit ────────────────────────────────────────────────────────────────

describe("quickExit", () => {
  it("calls setPrivacyCover(true) synchronously before any async work", async () => {
    const setPrivacyCover = jest.fn();
    quickExit(setPrivacyCover);
    // Must be called before any timers or awaits
    expect(setPrivacyCover).toHaveBeenCalledWith(true);
    expect(setPrivacyCover).toHaveBeenCalledTimes(1);
  });

  it("navigates to weather.com after the 120ms delay", async () => {
    const setPrivacyCover = jest.fn();
    await quickExit(setPrivacyCover);

    jest.runAllTimers();
    // Flush the async chain inside the setTimeout: canOpenURL → openURL
    await Promise.resolve();
    await Promise.resolve();

    expect(mockOpen).toHaveBeenCalledWith("https://www.weather.com");
  });

  it("calls the optional onBeforeExit callback synchronously before navigation", async () => {
    const order: string[] = [];
    const setPrivacyCover = jest.fn(() => order.push("cover"));
    const onBeforeExit = jest.fn(() => order.push("cleanup"));

    await quickExit(setPrivacyCover, onBeforeExit);

    expect(onBeforeExit).toHaveBeenCalledTimes(1);
    // cover must happen before cleanup
    expect(order.indexOf("cover")).toBeLessThan(order.indexOf("cleanup"));
  });

  it("does not call onBeforeExit when not provided", async () => {
    const setPrivacyCover = jest.fn();
    await expect(quickExit(setPrivacyCover)).resolves.toBeUndefined();
  });

  it("does not open a URL if canOpenURL returns false", async () => {
    mockCanOpen.mockResolvedValue(false);
    const setPrivacyCover = jest.fn();

    await quickExit(setPrivacyCover);
    jest.runAllTimers();
    await Promise.resolve();
    await Promise.resolve();

    expect(mockOpen).not.toHaveBeenCalled();
  });

  it("does not throw if Linking.openURL rejects — cover still shown", async () => {
    mockOpen.mockRejectedValue(new Error("OS failure"));
    const setPrivacyCover = jest.fn();

    await quickExit(setPrivacyCover);
    jest.runAllTimers();
    await Promise.resolve();
    await Promise.resolve();

    // The privacy cover was still applied
    expect(setPrivacyCover).toHaveBeenCalledWith(true);
  });

  it("does not throw if canOpenURL rejects", async () => {
    mockCanOpen.mockRejectedValue(new Error("Network unavailable"));
    const setPrivacyCover = jest.fn();

    await quickExit(setPrivacyCover);
    jest.runAllTimers();
    await Promise.resolve();
    await Promise.resolve();

    expect(setPrivacyCover).toHaveBeenCalledWith(true);
  });

  it("navigates to a neutral, non-app-specific destination", async () => {
    const setPrivacyCover = jest.fn();
    await quickExit(setPrivacyCover);
    jest.runAllTimers();
    await Promise.resolve();
    await Promise.resolve();

    const url: string = mockOpen.mock.calls[0]?.[0] ?? "";
    expect(url).not.toContain("bastet");
    expect(url).not.toContain("dv-support");
    expect(url).toMatch(/^https:\/\//);
  });
});
