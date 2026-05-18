import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Location from "expo-location";
import { quickExit } from "@/src/utils/quickExit";
import { Colors, Spacing, Radius, Typography } from "@/constants/theme";
import { matchQuery, getFAQsByCategory, getSuggestedQuestions } from "@/src/utils/faqMatcher";
import { FAQ_CATEGORIES, GREETING_MESSAGE, FALLBACK_MESSAGE, FAQItem } from "@/src/data/faqData";
import sheltersData from "@/data/shelters.sc.json";

const C = Colors.light;

// Shelter type
type Shelter = {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  hotline: string | null;
  callForAddress?: boolean;
  callForAddressNote?: string;
};

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

type Message = {
  id: string;
  type: "user" | "bot" | "greeting" | "category" | "shelters";
  text?: string;
  faqItem?: FAQItem;
  suggestions?: FAQItem[];
  category?: string;
  shelters?: Array<Shelter & { distance: number }>;
  showBrowseAction?: boolean;
};

export default function BastBotScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "greeting",
      type: "greeting",
      text: GREETING_MESSAGE,
      suggestions: getSuggestedQuestions(3),
    },
  ]);

  const [input, setInput] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = input.trim();
    setInput("");

    // Check if this is a location/shelter query FIRST (before FAQ matching)
    const locationKeywords = [
      "where can i go",
      "find shelter",
      "help now",
      "help me", // FEATURE REQUEST #1
      "nearest shelter",
      "closest shelter", // FEATURE REQUEST #2
      "shelter near me",
      "i need help",
      "emergency",
      "where do i go",
      "find help",
      "right now",
      "what are my options",
      "my options",
      "options for",
    ];

    const isLocationQuery = locationKeywords.some((keyword) =>
      query.toLowerCase().includes(keyword)
    );

    if (isLocationQuery) {
      handleShelterSearch();
      return;
    }

    // Otherwise, match FAQ query
    const matches = matchQuery(query, 3);

    if (matches.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-bot",
          type: "bot",
          text: FALLBACK_MESSAGE,
        },
      ]);
    } else if (matches[0].matchType === "exact" || matches[0].matchType === "high") {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-bot",
          type: "bot",
          faqItem: matches[0].item,
          suggestions: getSuggestedQuestions(2),
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-bot",
          type: "bot",
          text: "I found a few things that might help:",
          suggestions: matches.map((m) => m.item),
        },
      ]);
    }
  };

  const handleShelterSearch = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "-bot",
            type: "bot",
            text: "I need location permission to find shelters near you. You can enable it in your device settings, or call the National DV Hotline at 1-800-799-7233 for help finding shelter.",
            showBrowseAction: true,
          },
        ]);
        return;
      }

      // Get location
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-bot",
          type: "bot",
          text: "Finding shelters near you...",
        },
      ]);

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userLat = location.coords.latitude;
      const userLon = location.coords.longitude;

      // Calculate distances and sort
      const sheltersWithDistance = (sheltersData as Shelter[])
        .map((shelter) => ({
          ...shelter,
          distance: calculateDistance(userLat, userLon, shelter.latitude, shelter.longitude),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);

      // Remove "finding..." message and add results
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.text !== "Finding shelters near you...");
        return [
          ...filtered,
          {
            id: Date.now().toString() + "-shelters",
            type: "shelters",
            shelters: sheltersWithDistance,
            text: "Here are the 3 nearest shelters:",
          },
        ];
      });
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-bot",
          type: "bot",
          text: "I couldn't get your location right now. You can call the National DV Hotline at 1-800-799-7233 — they're available 24/7 and can help you find shelter.",
          showBrowseAction: true,
        },
      ]);
    }
  };

  const handleQuestionTap = (faqItem: FAQItem) => {
    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "user",
        text: faqItem.question,
      },
    ]);

    // Check if this question should trigger shelter search instead of FAQ answer
    const locationKeywords = [
      "where can i go",
      "find shelter",
      "help now",
      "help me", // FEATURE REQUEST #1
      "nearest shelter",
      "closest shelter", // FEATURE REQUEST #2
      "shelter near me",
      "i need help",
      "emergency",
      "where do i go",
      "find help",
      "right now",
      "what are my options",
      "my options",
      "options for",
    ];

    const isLocationQuery = locationKeywords.some((keyword) =>
      faqItem.question.toLowerCase().includes(keyword)
    );

    if (isLocationQuery) {
      handleShelterSearch();
      return;
    }

    // Otherwise show FAQ answer
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + "-bot",
        type: "bot",
        faqItem,
        suggestions: getSuggestedQuestions(2),
      },
    ]);
  };

  const handleCategoryTap = (category: string) => {
    const faqs = getFAQsByCategory(category);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + "-cat",
        type: "category",
        category,
        suggestions: faqs,
      },
    ]);
  };

  const openLink = async (url: string) => {
    try {
      const result = await WebBrowser.openBrowserAsync(url, {
        dismissButtonStyle: "close",
        controlsColor: C.primary,
        toolbarColor: C.background,
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      });
      console.log("WebBrowser result:", result);
    } catch (error) {
      console.error("WebBrowser error:", error);
      Alert.alert("Unable to open link", "Please try again.");
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>BastBot</Text>
          <TouchableOpacity
            onPress={() => quickExit()}
            style={styles.exitBtn}
            accessibilityLabel="Quick exit"
            accessibilityRole="button"
          >
            <Text style={styles.exitText}>Quick Exit</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.messagesArea}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onQuestionTap={handleQuestionTap}
                onCategoryTap={handleCategoryTap}
                onLinkTap={openLink}
                onBrowseShelters={() => router.push({ pathname: "/shelters", params: { lat: "", lon: "" } })}
              />
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Ask me anything..."
              placeholderTextColor={C.textMuted}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
            />
            <TouchableOpacity
              onPress={handleSend}
              style={styles.sendBtn}
              accessibilityLabel="Send message"
              accessibilityRole="button"
            >
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

// ─── Message Bubble Component ─────────────────────────────────────────────────

type MessageBubbleProps = {
  message: Message;
  onQuestionTap: (item: FAQItem) => void;
  onCategoryTap: (category: string) => void;
  onLinkTap: (url: string) => void;
  onBrowseShelters: () => void;
};

function MessageBubble({ message, onQuestionTap, onCategoryTap, onLinkTap, onBrowseShelters }: MessageBubbleProps) {
  if (message.type === "user") {
    return (
      <View style={styles.userBubbleContainer}>
        <View style={styles.userBubble}>
          <Text style={styles.userBubbleText}>{message.text}</Text>
        </View>
      </View>
    );
  }

  if (message.type === "greeting") {
    return (
      <View style={styles.botBubbleContainer}>
        <View style={styles.botBubble}>
          <Text style={styles.botBubbleText}>{message.text}</Text>

          {/* Category buttons */}
          {message.suggestions && message.suggestions.length > 0 && (
            <View style={styles.suggestionsBlock}>
              {message.suggestions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => onQuestionTap(item)}
                  style={styles.suggestionBtn}
                  accessibilityLabel={item.question}
                  accessibilityRole="button"
                >
                  <Text style={styles.suggestionText}>{item.question}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Category buttons */}
          <View style={styles.categoryButtons}>
            {FAQ_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => onCategoryTap(cat)}
                style={styles.categoryBtn}
                accessibilityLabel={cat}
                accessibilityRole="button"
              >
                <Text style={styles.categoryBtnText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (message.type === "category") {
    return (
      <View style={styles.botBubbleContainer}>
        <View style={styles.botBubble}>
          <Text style={styles.botBubbleText}>Here are questions about {message.category}:</Text>

          {message.suggestions && message.suggestions.length > 0 && (
            <View style={styles.suggestionsBlock}>
              {message.suggestions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => onQuestionTap(item)}
                  style={styles.suggestionBtn}
                  accessibilityLabel={item.question}
                  accessibilityRole="button"
                >
                  <Text style={styles.suggestionText}>{item.question}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }

  if (message.type === "shelters") {
    return (
      <View style={styles.botBubbleContainer}>
        <View style={styles.botBubble}>
          <Text style={styles.botBubbleText}>{message.text}</Text>

          {message.shelters && message.shelters.length > 0 && (
            <View style={styles.sheltersBlock}>
              {message.shelters.map((shelter) => (
                <ShelterCard key={shelter.id} shelter={shelter} />
              ))}
            </View>
          )}

          <View style={styles.shelterFooter}>
            <Text style={styles.shelterFooterText}>
              💡 Always call first — bed availability changes constantly
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Bot message with FAQ answer
  return (
    <View style={styles.botBubbleContainer}>
      <View style={styles.botBubble}>
        {message.text && <Text style={styles.botBubbleText}>{message.text}</Text>}

        {message.showBrowseAction && (
          <TouchableOpacity
            onPress={onBrowseShelters}
            style={styles.browseBtn}
            accessibilityLabel="Browse all shelters"
            accessibilityRole="button"
          >
            <Text style={styles.browseBtnText}>Browse All Shelters</Text>
          </TouchableOpacity>
        )}

        {message.faqItem && (
          <>
            <Text style={styles.botBubbleAnswer}>{message.faqItem.answer}</Text>

            {/* Links */}
            {message.faqItem.links && message.faqItem.links.length > 0 && (
              <View style={styles.linksBlock}>
                {message.faqItem.links.map((link, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => onLinkTap(link.url)}
                    style={styles.linkBtn}
                    accessibilityLabel={`Open ${link.text}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.linkText}>→ {link.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {/* Suggested follow-up questions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <View style={styles.suggestionsBlock}>
            <Text style={styles.suggestionsLabel}>You might also ask:</Text>
            {message.suggestions.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => onQuestionTap(item)}
                style={styles.suggestionBtn}
                accessibilityLabel={item.question}
                accessibilityRole="button"
              >
                <Text style={styles.suggestionText}>{item.question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Shelter Card Component ───────────────────────────────────────────────────

type ShelterCardProps = {
  shelter: Shelter & { distance: number };
};

function ShelterCard({ shelter }: ShelterCardProps) {
  const handleCall = () => {
    const phoneNumber = shelter.phone || shelter.hotline;
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber.replace(/[^0-9]/g, "")}`);
    }
  };

  const handleDirections = () => {
    const url = Platform.select({
      ios: `maps://app?daddr=${shelter.latitude},${shelter.longitude}`,
      android: `google.navigation:q=${shelter.latitude},${shelter.longitude}`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {
        // Fallback to Google Maps web
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${shelter.latitude},${shelter.longitude}`
        );
      });
    }
  };

  const phoneNumber = shelter.phone || shelter.hotline;

  return (
    <View style={styles.shelterCard}>
      <View style={styles.shelterHeader}>
        <View style={styles.shelterHeaderLeft}>
          <Text style={styles.shelterName}>{shelter.name}</Text>
          <Text style={styles.shelterCity}>
            {shelter.city} • {shelter.distance.toFixed(1)} mi away
          </Text>
        </View>
      </View>

      {/* FIX BUG #4: Always show phone number first if available */}
      {phoneNumber && (
        <Text style={styles.shelterPhone}>{phoneNumber}</Text>
      )}

      {shelter.callForAddress ? (
        <View style={styles.callForAddressBox}>
          <Text style={styles.callForAddressNote}>{shelter.callForAddressNote}</Text>
        </View>
      ) : (
        <Text style={styles.shelterAddress}>{shelter.address}</Text>
      )}

      <View style={styles.shelterActions}>
        {phoneNumber && (
          <TouchableOpacity
            onPress={handleCall}
            style={styles.shelterCallBtn}
            accessibilityLabel={`Call ${shelter.name}`}
            accessibilityRole="button"
          >
            <Text style={styles.shelterCallText}>Call</Text>
          </TouchableOpacity>
        )}

        {!shelter.callForAddress && (
          <TouchableOpacity
            onPress={handleDirections}
            style={styles.shelterDirectionsBtn}
            accessibilityLabel={`Get directions to ${shelter.name}`}
            accessibilityRole="button"
          >
            <Text style={styles.shelterDirectionsText}>Directions</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
    backgroundColor: C.surface,
  },
  headerTitle: {
    fontFamily: Typography.headingSemi,
    fontSize: 18,
    color: C.primary,
  },
  exitBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  exitText: {
    fontFamily: Typography.sansSemi,
    fontSize: 13,
    color: "#FFFFFF",
  },
  chatContainer: {
    flex: 1,
  },
  messagesArea: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },

  // User bubbles
  userBubbleContainer: {
    alignItems: "flex-end",
    marginBottom: Spacing.md,
  },
  userBubble: {
    backgroundColor: C.primary,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    maxWidth: "80%",
  },
  userBubbleText: {
    fontFamily: Typography.sans,
    fontSize: 15,
    color: "#FFFFFF",
    lineHeight: 21,
  },

  // Bot bubbles
  botBubbleContainer: {
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  botBubble: {
    backgroundColor: C.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    maxWidth: "90%",
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  botBubbleText: {
    fontFamily: Typography.sans,
    fontSize: 15,
    color: C.textPrimary,
    lineHeight: 21,
    marginBottom: Spacing.xs,
  },
  botBubbleAnswer: {
    fontFamily: Typography.sans,
    fontSize: 15,
    color: C.textPrimary,
    lineHeight: 22,
  },

  // Links
  linksBlock: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  linkBtn: {
    backgroundColor: C.stone,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  linkText: {
    fontFamily: Typography.sansMed,
    fontSize: 14,
    color: C.primary,
  },

  // Suggestions
  suggestionsBlock: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  suggestionsLabel: {
    fontFamily: Typography.bodySm,
    fontSize: 12,
    color: C.textMuted,
    marginBottom: Spacing.xs,
  },
  suggestionBtn: {
    backgroundColor: C.stone,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  suggestionText: {
    fontFamily: Typography.sans,
    fontSize: 14,
    color: C.textSecondary,
  },

  // Category buttons
  categoryButtons: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  categoryBtn: {
    backgroundColor: C.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    alignItems: "center",
  },
  categoryBtnText: {
    fontFamily: Typography.sansSemi,
    fontSize: 14,
    color: "#FFFFFF",
  },

  // Input
  inputContainer: {
    flexDirection: "row",
    padding: Spacing.md,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.cardBorder,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: C.stone,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontFamily: Typography.sans,
    fontSize: 15,
    color: C.textPrimary,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    justifyContent: "center",
  },
  sendBtnText: {
    fontFamily: Typography.sansSemi,
    fontSize: 15,
    color: "#FFFFFF",
  },

  // Shelters
  sheltersBlock: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  shelterCard: {
    backgroundColor: C.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.primary,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  shelterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  shelterHeaderLeft: {
    flex: 1,
  },
  shelterName: {
    fontFamily: Typography.sansMed,
    fontSize: 15,
    color: C.primary,
    marginBottom: 2,
  },
  shelterCity: {
    fontFamily: Typography.sans,
    fontSize: 12,
    color: C.textMuted,
  },
  shelterPhone: {
    fontFamily: Typography.sansMed,
    fontSize: 14,
    color: C.primary,
    marginTop: 4,
  },
  shelterAddress: {
    fontFamily: Typography.sans,
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 18,
  },
  callForAddressBox: {
    backgroundColor: C.callBg,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: C.callBorder,
  },
  callForAddressNote: {
    fontFamily: Typography.sans,
    fontSize: 12,
    color: C.callText,
    lineHeight: 17,
  },
  shelterActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  shelterCallBtn: {
    flex: 1,
    backgroundColor: C.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  shelterCallText: {
    fontFamily: Typography.sansSemi,
    fontSize: 14,
    color: "#FFFFFF",
  },
  shelterDirectionsBtn: {
    flex: 1,
    backgroundColor: C.stone,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  shelterDirectionsText: {
    fontFamily: Typography.sansSemi,
    fontSize: 14,
    color: C.textPrimary,
  },
  browseBtn: {
    marginTop: Spacing.md,
    backgroundColor: C.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
  },
  browseBtnText: {
    fontFamily: Typography.sansSemi,
    fontSize: 14,
    color: "#FFFFFF",
  },
  shelterFooter: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: C.cardBorder,
  },
  shelterFooterText: {
    fontFamily: Typography.sansSemi,
    fontSize: 13,
    color: C.textPrimary,
    textAlign: "center",
  },
});
