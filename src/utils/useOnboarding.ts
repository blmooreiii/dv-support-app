// src/utils/useOnboarding.ts
// Manages onboarding state — first launch detection and replay flag.
//
// Usage:
//   const { shouldShow, complete } = useOnboarding();
//   if (shouldShow === null) return null; // still loading
//   if (shouldShow) return <OnboardingScreen onDone={complete} />;

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@bastet_onboarding_complete';

export function useOnboarding() {
  const [shouldShow, setShouldShow] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((val) => setShouldShow(val === null))
      .catch(() => setShouldShow(false)); // fail safe — don't block the app
  }, []);

  const complete = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setShouldShow(false);
  };

  // Call this from Settings to allow replay
  const reset = async () => {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    setShouldShow(true);
  };

  return { shouldShow, complete, reset };
}
