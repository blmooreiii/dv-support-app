import React, { useMemo, useState } from "react";
import { Alert, Linking, Platform, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import * as Location from "expo-location";

export default function HomeScreen() {
  const [status, setStatus] = useState<"idle" | "requesting" | "granted" | "denied" | "error">("idle");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const mockShelter = {
    name: "Hope Haven Shelter",
    address: "Charleston, SC",
    distance: "2.3 miles away",
    coords: { latitude: 32.7765, longitude: -79.9311 },
  };
  

  const sampleShelterCoords = useMemo(() => {
    // Test destination (Charleston, SC)
    return { latitude: 32.7765, longitude: -79.9311 };
  }, []);

  const requestLocation = async () => {
    try {
      setStatus("requesting");
      setErrorMsg("");

      const { status: permStatus } = await Location.requestForegroundPermissionsAsync();

      if (permStatus !== "granted") {
        setStatus("denied");
        setCoords(null);
        return;
      }

      setStatus("granted");
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCoords({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e?.message ?? "Unknown error requesting location.");
    }
  };

  const openMapsToDestination = async (destination: { latitude: number; longitude: number }) => {
    const { latitude, longitude } = destination;
  
    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?daddr=${latitude},${longitude}`
        : Platform.OS === "android"
        ? `geo:0,0?q=${latitude},${longitude}(Destination)`
        : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert("Unable to open maps", "No maps app available on this device.");
      return;
    }
  
    await Linking.openURL(url);
  };
  

  const offlineFallback = () => {
    Alert.alert(
      "Offline / No Data",
      "We can’t load nearby resources right now. If it’s safe, contact the National DV Hotline."
    );
  };

  const Pill = ({ label }: { label: string }) => (
    <View style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1 }}>
      <Text>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <View style={{ gap: 12 }}>
        <Text style={{ fontSize: 28, fontWeight: "700" }}>Local Help</Text>

        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Pill label={`Status: ${status}`} />
          {coords && <Pill label={`Lat: ${coords.latitude.toFixed(4)}`} />}
          {coords && <Pill label={`Lng: ${coords.longitude.toFixed(4)}`} />}
        </View>

        {errorMsg ? <Text style={{ color: "crimson" }}>{errorMsg}</Text> : null}

        <TouchableOpacity
          onPress={requestLocation}
          style={{ padding: 16, borderRadius: 12, borderWidth: 1, alignItems: "center" }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600" }}>Use Location</Text>
          <Text style={{ marginTop: 6 }}>Your location is only used to find nearby help.</Text>
        </TouchableOpacity>

        {status === "granted" && (
  <View style={{ borderWidth: 1, borderRadius: 12, padding: 14, gap: 8 }}>
    <Text style={{ fontSize: 18, fontWeight: "700" }}>Shelter Found</Text>

    <Text style={{ fontSize: 16, fontWeight: "600" }}>{mockShelter.name}</Text>
    <Text>{mockShelter.distance}</Text>
    <Text>{mockShelter.address}</Text>

    <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
      <TouchableOpacity
        onPress={() => openMapsToDestination(mockShelter.coords)}
        style={{ flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: "center" }}
      >
        <Text style={{ fontWeight: "600" }}>Start Directions</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => Alert.alert("Other Shelters", "List view coming next.")}
        style={{ flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: "center" }}
      >
        <Text style={{ fontWeight: "600" }}>Other Shelters</Text>
      </TouchableOpacity>
    </View>
  </View>
)}


        <TouchableOpacity
          onPress={offlineFallback}
          style={{ padding: 16, borderRadius: 12, borderWidth: 1, alignItems: "center" }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600" }}>Offline / No Data </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
