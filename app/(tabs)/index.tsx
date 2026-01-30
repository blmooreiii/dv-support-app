import React, { useState } from "react";
import { Alert, Linking, Platform, SafeAreaView, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import sheltersData from "../../data/shelters.sc.json";

export default function HomeScreen() {
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

  // Flattening the data immediately to prevent nested array issues
  const shelters: Shelter[] = (sheltersData as any).flat();

  const [status, setStatus] = useState<"idle" | "requesting" | "granted" | "denied" | "error">("idle");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [selectedShelter, setSelectedShelter] = useState<(Shelter & { distanceMiles: number }) | null>(null);
  const [privacyCover, setPrivacyCover] = useState(false);


  const DEBUG = false;

  const toRad = (v: number) => (v * Math.PI) / 180;

  // Haversine distance with safety checks to prevent NaN
  const distanceMiles = (
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number }
  ) => {
    // Safety check: if coords are missing, return a large distance so it's not "closest"
    if (![a?.latitude, a?.longitude, b?.latitude, b?.longitude].every(Number.isFinite)) return 999999;


    const R = 3958.8;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
  
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
  
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  };
  
  const findClosestShelter = (user: { latitude: number; longitude: number }, list: Shelter[]) => {
    let closest: (Shelter & { distanceMiles: number }) | null = null;

    for (const s of list) {
      const d = distanceMiles(user, { latitude: s.latitude, longitude: s.longitude });
      if (!closest || d < closest.distanceMiles) {
        closest = { ...s, distanceMiles: d };
      }
    }
    return closest;
  };

  const requestLocation = async () => {
    try {
      setStatus("requesting");
      setErrorMsg("");
  
      const existing = await Location.getForegroundPermissionsAsync();
      let permStatus = existing.status;
  
      if (permStatus !== "granted") {
        const req = await Location.requestForegroundPermissionsAsync();
        permStatus = req.status;
      }
  
      if (permStatus !== "granted") {
        setStatus("denied");
        return;
      }
  
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setStatus("error");
        setErrorMsg("Location Services are off. Enable them in Settings.");
        return;
      }
  
      // Using Highest accuracy for the best results, though Balanced is faster
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
  
      const lat = Number(current.coords.latitude);
      const lon = Number(current.coords.longitude);
  
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        setStatus("error");
        setErrorMsg("Invalid location data received.");
        return;
      }
  
      const userCoords = { latitude: lat, longitude: lon };
      setCoords(userCoords);
  
      const closest = findClosestShelter(userCoords, shelters);
      if (!closest) {
        setStatus("error");
        setErrorMsg("No shelter data found.");
        return;
      }
  
      setSelectedShelter(closest);
      setStatus("granted");
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e?.message ?? "Error accessing location.");
    }
  };

  const resetHome = () => {
    setStatus("idle");
    setCoords(null);
    setErrorMsg("");
    setSelectedShelter(null);
  };

  const openMapsToDestination = async (destination: { latitude: number; longitude: number }) => {
    const { latitude, longitude } = destination;

    // Fixed Google Maps URL string
    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?daddr=${latitude},${longitude}`
        : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
        await Linking.openURL(url);
    } else {
        Alert.alert("Error", "Could not open Maps app.");
    }
  };

  const quickExit = async () => {
    setPrivacyCover(true);
    resetHome();
  
    const safeUrl = "https://www.weather.com";
    setTimeout(async () => {
      try {
        await Linking.openURL(safeUrl);
      } catch {}
    }, 120);
  };
  

  const offlineFallback = () => {
    Alert.alert(
      "Direct Support",
      "National Domestic Violence Hotline:\n\n📞 1-800-799-7233\n📱 Text START to 88788",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <TouchableOpacity onPress={quickExit} style={{ padding: 8, borderRadius: 20, borderWidth: 1.5, borderColor: "#C62828" }}>
            <Text style={{ fontWeight: "600", color: "#C62828" }}>Quick Exit</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 40, gap: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: "700" }}>You’re not alone.</Text>
          <Text style={{ fontSize: 16 }}>If it’s safe, we can help you find nearby support fast.</Text>

          {status === "requesting" ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#000" />
              <Text style={{ marginTop: 10 }}>Finding nearest shelter...</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={requestLocation}
              style={{ padding: 20, borderRadius: 16, backgroundColor: "#000", alignItems: "center" }}
            >
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#fff" }}>Get Help</Text>
              <Text style={{ marginTop: 6, color: "#ccc", textAlign: "center" }}>We use your location only to find nearby help.</Text>
            </TouchableOpacity>
          )}

          {errorMsg ? <Text style={{ color: "crimson", textAlign: 'center' }}>{errorMsg}</Text> : null}

          {status === "granted" && selectedShelter && (
            <View style={{ borderWidth: 1, borderRadius: 12, padding: 16, marginTop: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 18, fontWeight: "700" }}>Shelter Found</Text>
                <TouchableOpacity onPress={resetHome}><Text style={{ fontWeight: "600" }}>Start Over</Text></TouchableOpacity>
              </View>
              <Text style={{ fontSize: 16, fontWeight: "600", marginTop: 8 }}>{selectedShelter.name}</Text>
              <Text style={{ color: '#666' }}>{selectedShelter.distanceMiles.toFixed(1)} miles away</Text>
              
              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <TouchableOpacity
                  onPress={() => openMapsToDestination(selectedShelter)}
                  style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#eee", alignItems: "center" }}
                >
                  <Text style={{ fontWeight: "600" }}>Start Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity onPress={offlineFallback} style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#ccc", alignItems: "center", marginTop: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: "500" }}>Resources & Hotlines</Text>
          </TouchableOpacity>
        </View>
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
      padding: 24,
      zIndex: 9999,
      elevation: 9999,
    }}
  >
    <Text style={{ fontSize: 18, fontWeight: "700" }}>Loading...</Text>
  </View>
)}


    </SafeAreaView>
  );
}
