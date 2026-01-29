import React, { useMemo, useState } from "react";
import { Alert, Linking, Platform, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import * as Location from "expo-location";

export default function HomeScreen() {
  const [status, setStatus] = useState<"idle" | "requesting" | "granted" | "denied" | "error">("idle");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const DEBUG = false;


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
  
  const quickExit = async () => {
    const safeUrl = "https://www.weather.com";
  
    const canOpen = await Linking.canOpenURL(safeUrl);
    if (!canOpen) return;
  
    await Linking.openURL(safeUrl);
  };
  

  const offlineFallback = () => {
    Alert.alert(
      "Offline / No Data",
      `We can’t load nearby resources right now.
  
  If it’s safe to do so, you can contact the National Domestic Violence Hotline:
  
  📞 Call: 1-800-799-7233
  📱 Text: START to 88788
  
  If you are in immediate danger, call 911.
  
  They are available 24/7 and can help you find local support.`,
      [{ text: "OK" }]
    );
  };
  
  

  const Pill = ({ label }: { label: string }) => (
    <View style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1 }}>
      <Text>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      {/* Top-right Quick Exit row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginBottom: 16,
          paddingHorizontal: 16 
        }}
      >
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
          <Text style={{ fontWeight: "600", color: "#C62828" }}>Quick Exit</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 0.15 }} />
      {/* STEP 3: Main content wrapper */}
      <View style={{ gap: 12, paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "700" }}>You’re not alone.</Text>
  
        <Text style={{ fontSize: 16, lineHeight: 22 }}>
          If it’s safe, we can help you find nearby support fast.
        </Text>
  
        {/* Debug pills (optional: wrap in DEBUG later) */}
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Pill label={`Status: ${status}`} />
          {coords && <Pill label={`Lat: ${coords.latitude.toFixed(4)}`} />}
          {coords && <Pill label={`Lng: ${coords.longitude.toFixed(4)}`} />}
        </View>
  
        {errorMsg ? <Text style={{ color: "crimson" }}>{errorMsg}</Text> : null}
  
        {/* Primary CTA */}
        <TouchableOpacity
          onPress={requestLocation}
          style={{
            paddingVertical: 18,
            paddingHorizontal: 16,
            borderRadius: 16,
            backgroundColor: "#000",
            alignItems: "center",
            
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#fff" }}>
            Get Help
          </Text>
          <Text style={{ marginTop: 6, color: "#e5e5e5", textAlign: "center" }}>
            We use your location only to find nearby help — and we don’t store it.
          </Text>
        </TouchableOpacity>
  
        {/* Shelter card */}
        {status === "granted" && (
          <View style={{ borderWidth: 1, borderRadius: 12, padding: 14, gap: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>Shelter Found</Text>
  
            <Text style={{ fontSize: 16, fontWeight: "600" }}>{mockShelter.name}</Text>
            <Text>{mockShelter.distance}</Text>
            <Text>{mockShelter.address}</Text>
  
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => openMapsToDestination(mockShelter.coords)}
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: "#F7F7F7",
                  borderColor: "#D9D9D9",

                  borderRadius: 10,
                  borderWidth: 1,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "600" }}>Start Directions</Text>
              </TouchableOpacity>
  
              <TouchableOpacity
                onPress={() => Alert.alert("Other Shelters", "List view coming next.")}
                style={{
                  flex: 1,
                  padding: 12,
                  borderColor: "#CFCFCF",
                  borderRadius: 10,
                  borderWidth: 1,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "600" }}>Other Shelters</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
  
        {/* Secondary action */}
        <TouchableOpacity
          onPress={offlineFallback}
          style={{
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#ccc",
            alignItems: "center",
            
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "500" }}>Resources & Hotlines</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
  
}
