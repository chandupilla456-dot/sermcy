import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { theme } from "../../lib/theme";

export default function Terms() {
  const sections = [
    { title: "1. Acceptance of Terms", content: "By using Sermcy app, you agree to these terms and conditions. If you do not agree, please do not use our services." },
    { title: "2. Our Services", content: "Sermcy provides fresh juice, thick shake, and ice cream delivery services. We operate within specific service areas and delivery times (8 AM - 10 PM)." },
    { title: "3. Orders & Payment", content: "All orders are subject to availability. We currently accept Cash on Delivery. Prices are inclusive of all taxes." },
    { title: "4. Delivery", content: "We aim to deliver within 20-30 minutes. Delivery times may vary based on distance, traffic, and order volume." },
    { title: "5. Cancellations", content: "Orders can be cancelled within 2 minutes of placement. After preparation begins, cancellations may not be accepted." },
    { title: "6. Quality Guarantee", content: "All our products are made fresh to order with no preservatives. If you are not satisfied, please contact us immediately." },
    { title: "7. User Account", content: "You are responsible for maintaining the confidentiality of your account credentials. Please notify us of any unauthorized use." },
    { title: "8. Changes to Terms", content: "Sermcy reserves the right to modify these terms at any time. Continued use of the app constitutes acceptance of the new terms." },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ backgroundColor: theme.primary, paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontSize: 16 }}>? Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: "bold", color: "#fff" }}>Terms & Conditions</Text>
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
        <Text style={{ textAlign: "center", color: theme.subtext, fontSize: 12, marginTop: 20, marginBottom: 20 }}>Sermcy - Fresh Juices, Shakes & Ice Creams</Text>
      </View>
    </ScrollView>
  );
}
