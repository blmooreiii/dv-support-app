import * as Location from "expo-location";

export type Coords = { latitude: number; longitude: number };

type Result =
  | { ok: true; coords: Coords; source: "fresh" | "lastKnown" }
  | { ok: false; reason: "permission_denied" | "timeout" | "unavailable" | "error"; message?: string };

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return Promise.race<T>([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), ms)
    ),
  ]);
}

export async function getCoordsWithTimeout(opts?: {
  timeoutMs?: number;
  accuracy?: Location.LocationAccuracy;
}): Promise<Result> {
  const timeoutMs = opts?.timeoutMs ?? 9000;
  const accuracy = opts?.accuracy ?? Location.LocationAccuracy.Balanced;

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return { ok: false, reason: "permission_denied" };
    }

    // 1) Try fresh GPS fix with timeout
    try {
      const pos = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy }),
        timeoutMs
      );

      return {
        ok: true,
        coords: {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        },
        source: "fresh",
      };
    } catch (e: any) {
      // 2) Timeout or GPS failed → try last known
      const last = await Location.getLastKnownPositionAsync();
      if (last?.coords) {
        return {
          ok: true,
          coords: {
            latitude: last.coords.latitude,
            longitude: last.coords.longitude,
          },
          source: "lastKnown",
        };
      }

      // No last known available
      const isTimeout = e?.message === "TIMEOUT";
      return {
        ok: false,
        reason: isTimeout ? "timeout" : "unavailable",
        message: isTimeout
          ? "Location is taking too long. Try moving near a window or turning on GPS."
          : "Location unavailable right now.",
      };
    }
  } catch (e: any) {
    return { ok: false, reason: "error", message: e?.message };
  }
}
