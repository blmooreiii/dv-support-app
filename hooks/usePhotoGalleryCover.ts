import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

export function usePhotoGalleryCover() {
  const [showCover, setShowCover] = useState(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      const prev = appStateRef.current;
      appStateRef.current = next;

      // Show the gallery cover whenever the app foregrounds from background/inactive.
      // This fires *after* the OS has already shown the blank PrivacyCover in the
      // app switcher, so the two layers never race each other.
      if ((prev === "background" || prev === "inactive") && next === "active") {
        setShowCover(true);
      }
    });

    return () => sub.remove();
  }, []);

  return { showCover, dismissCover: () => setShowCover(false) };
}
