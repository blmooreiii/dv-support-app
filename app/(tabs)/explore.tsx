import React, { useEffect, useState } from "react";
import { AppState, Linking, SafeAreaView, Text, TouchableOpacity, View, Alert } from "react-native";

type Item = {
  title: string;
  subtitle?: string;
  action: () => void;
};

export default function ExploreScreen() {
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

  // optional: if you add more state later, reset it here

  const safeUrl = "https://www.weather.com";
  setTimeout(async () => {
    try {
      await Linking.openURL(safeUrl);
    } catch {}
  }, 120);
};


  const open = async (url: string) => {
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) return Alert.alert("Unable to open", "No browser available.");
      await Linking.openURL(url);
    } catch {
      Alert.alert("Unable to open", "Please try again.");
    }
  };

  const items: Item[] = [
    {
      title: "Hotlines (24/7)",
      subtitle: "Call / text options",
      action: () =>
        Alert.alert(
          "Direct Support",
          "National Domestic Violence Hotline:\n\n📞 1-800-799-7233\n📱 Text START to 88788\n\nIf you are in immediate danger, call 911.",
          [{ text: "OK" }]
        ),
    },
    {
      title: "Safety Planning",
      subtitle: "Steps you can take to prepare",
      action: () => open("https://www.thehotline.org/plan-for-safety/"),
    },
    {
      title: "Tech Safety",
      subtitle: "Phone, location, privacy tips",
      action: () => open("https://www.thehotline.org/resources/digital-services/"),
    },
    {
      title: "Legal Help",
      subtitle: "Protection orders & rights",
      action: () => open("https://www.womenslaw.org/"),
    },
    {
      title: "Find Local Programs",
      subtitle: "Search by area",
      action: () => open("https://www.thehotline.org/get-help/domestic-violence-local-resources/"),
    },
  ];

  const Card = ({ item }: { item: Item }) => (
    <TouchableOpacity
      onPress={item.action}
      style={{
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 14,
        padding: 14,
        backgroundColor: "#fff",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700" }}>{item.title}</Text>
      {!!item.subtitle && <Text style={{ marginTop: 6, color: "#666" }}>{item.subtitle}</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ padding: 16 }}>
        {/* Top-right Quick Exit */}
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <TouchableOpacity
            onPress={quickExit}
            style={{ paddingVertical: 6, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5, borderColor: "#C62828" }}
          >
            <Text style={{ fontWeight: "600", color: "#C62828" }}>Quick Exit</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 20, gap: 10 }}>
          <Text style={{ fontSize: 24, fontWeight: "800" }}>Support</Text>
          <Text style={{ color: "#444" }}>
            Browse resources when it’s safe. Use Quick Exit anytime.
          </Text>

          
        </View>
        <View style={{ marginTop: 10, gap: 10 }}>
          {items.map((item) => (
            <Card key={item.title} item={item} />
          ))}
        </View>

        {/* #5: Trust / sources line */}
        <Text
          style={{
            marginTop: 20,
            fontSize: 12,
            color: "#777",
            textAlign: "center",
          }}
        >
          Sources: TheHotline.org • WomensLaw.org
        </Text>

      </View>

      {/* Privacy cover overlay */}
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
          <Text style={{ fontSize: 18, fontWeight: "700" }}>Loading…</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
