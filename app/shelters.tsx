import React, { useEffect, useMemo, useState } from "react";
import {
  AppState,
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import sheltersData from "../data/shelters.sc.json";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";





type Shelter = {
  id: string;
  name: string;
  city: string;
  state: "SC";
  address: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  source: string;
};

type ShelterWithDistance = Shelter & { distanceMiles?: number };

export default function SheltersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lat?: string; lon?: string }>();

  const [privacyCover, setPrivacyCover] = useState(false);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "inactive" || state === "background") setPrivacyCover(true);
      if (state === "active") setTimeout(() => setPrivacyCover(false), 150);
    });
    return () => sub.remove();
  }, []);

  const quickExit = async () => {
    setPrivacyCover(true);
    setTimeout(async () => {
      try {
        await Linking.openURL("https://www.weather.com");
      } catch {}
    }, 120);
  };

  const shelters: Shelter[] = useMemo(() => {
    if (!Array.isArray(sheltersData)) return [];
    return (sheltersData as any[]).flat();
  }, []);

  const toRad = (v: number) => (v * Math.PI) / 180;

  const distanceMiles = (
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number }
  ) => {
    const lat1 = Number(a.latitude);
    const lon1 = Number(a.longitude);
    const lat2 = Number(b.latitude);
    const lon2 = Number(b.longitude);
    if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return NaN;

    const R = 3958.8;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const rLat1 = toRad(lat1);
    const rLat2 = toRad(lat2);

    let h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) ** 2;

    h = Math.min(1, Math.max(0, h));
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const userCoords = useMemo(() => {
    const lat = Number(params.lat);
    const lon = Number(params.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { latitude: lat, longitude: lon };
  }, [params.lat, params.lon]);

  const list: ShelterWithDistance[] = useMemo(() => {
    const base = shelters.filter(
      (s) =>
        Number.isFinite(Number(s.latitude)) &&
        Number.isFinite(Number(s.longitude)) &&
        !!s.name
    );

    if (!userCoords) return base.sort((a, b) => a.name.localeCompare(b.name));

    return base
      .map((s) => ({
        ...s,
        distanceMiles: distanceMiles(userCoords, {
          latitude: s.latitude,
          longitude: s.longitude,
        }),
      }))
      .sort((a, b) => {
        if (!Number.isFinite(a.distanceMiles)) return 1;
        if (!Number.isFinite(b.distanceMiles)) return -1;
        return (a.distanceMiles ?? 0) - (b.distanceMiles ?? 0);
      });
  }, [shelters, userCoords]);

  const openMaps = async (s: Shelter) => {
    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?daddr=${s.latitude},${s.longitude}`
        : `https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`;
    await Linking.openURL(url);
  };

  const renderItem = ({ item }: { item: ShelterWithDistance }) => (
    <View
      style={{
        borderWidth: 1,
        borderColor: "#E3E3E3",
        borderRadius: 14,
        padding: 14,
        backgroundColor: "#fff",
        marginBottom: 10,
      }}
    >
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 16, fontWeight: "800", flex: 1, paddingRight: 10 }}>
            {item.name}
        </Text>

        {item.verified && (
            <View
            style={{
                paddingVertical: 4,
                paddingHorizontal: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "#1D9BF0",
                backgroundColor: "#E8F3FF",
            }}
            >
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#1D9BF0"}}>Verified</Text>
        </View>
        )}
    </View>

      <Text style={{ color: "#555", marginTop: 4 }}>
        {item.city}, {item.state}
      </Text>

     {Number.isFinite(item.distanceMiles) ? (
        <Text style={{ color: "#666", marginTop: 6 }}>
            {(item.distanceMiles as number).toFixed(1)} miles away
        </Text>
    ) : (
        <Text style={{ color: "#666", marginTop: 6 }}>Distance unavailable</Text>
    )}


      <View style={{ marginTop: 10 }}>
        <TouchableOpacity
          onPress={() => openMaps(item)}
          style={{
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: "#eee",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "700" }}>Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
         <Stack.Screen options={{ headerShown: false }} />
      <View style={{ padding: 16, flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontWeight: "700" }}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={quickExit}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderRadius: 999,
              borderWidth: 1.5,
              borderColor: "#C62828",
            }}
          >
            <Text style={{ fontWeight: "600", color: "#C62828" }}>
              Quick Exit
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 24, fontWeight: "900", marginTop: 16 }}>
          Other Shelters
        </Text>
        <Text style={{ color: "#444", marginTop: 6 }}>
          Browse options and choose what feels safest.
        </Text>

        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={{ marginTop: 14 }}
        />
      </View>

      {privacyCover && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700" }}>Loading…</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
