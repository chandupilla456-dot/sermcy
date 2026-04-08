import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { theme } from "../../lib/theme";

export default function Privacy() {
  const sections = [
    { title: "1. Information We Collect", content: "We collect your name, email, phone number, and delivery address when you create an account. We also collect order history and app usage data." },
    { title: "2. How We Use Your Information", content: "Your information is used to process orders, provide delivery services, send order updates, and improve our app experience." },
    { title: "3. Information Sharing", content: "We do not sell your personal information. We share data only with delivery partners as necessary to fulfill your orders." },
    { title: "4. Data Security", content: "We use industry-standard encryption and security measures to protect your personal information. Your data is stored securely on Supabase servers." },
    { title: "5. Cookies & Analytics", content: "We use anonymous analytics to improve app performance. No personal data is shared with third-party advertisers." },
    { title: "6. Your Rights", content: "You can request to view, update, or delete your personal data at any time by contacting us at support@sermcy.com." },
    { title: "7. Children Privacy", content: "Our services are not directed to children under 13. We do not knowingly collect data from children." },
    { title: "8. Contact Us", content: "For privacy concerns, contact us at support@sermcy.com or WhatsApp +91 9949473727." },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ backgroundColor: theme.primary, paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontSize: 16 }}>? Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: "bold", color: "#fff" }}>Privacy Policy</Text>
        <Text style={{ fontSize: 14, color: "#E9D5FF", marginTop: 4 }}>Last updated: April 2026</Text>
      </View>

      <View style={{ padding: 20 }}>
        <View style={{ backgroundColor: theme.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#E9D5FF" }}>
          {sections.map((sec, i) => (
            <View key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottomWidth: i < sections.length - 1 ? 1 : 0, borderBottomColor: "#F3E8FF" }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: theme.primary, marginBottom: 8 }}>{sec.title}</Text>
              <Text style={{ fontSize: 13, color: theme.subtext, lineHeight: 22 }}>{sec.content}</Text>
            </View>
          ))}
        </View>
        <Text style={{ textAlign: "center", color: theme.subtext, fontSize: 12, marginTop: 20, marginBottom: 20 }}>Sermcy - Your privacy matters to us</Text>
      </View>
    </ScrollView>
  );
}
