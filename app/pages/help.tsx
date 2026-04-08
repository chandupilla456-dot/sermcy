import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import { theme } from "../../lib/theme";

export default function Help() {
  const faqs = [
    { q: "How long does delivery take?", a: "We deliver in 20-30 minutes within our service area." },
    { q: "How do I track my order?", a: "Go to Profile > Order History > Click on any order to track it live." },
    { q: "Can I cancel my order?", a: "You can cancel within 2 minutes of placing the order. Contact us on WhatsApp." },
    { q: "What payment methods do you accept?", a: "Currently Cash on Delivery. UPI/Card payments coming soon!" },
    { q: "Are your juices fresh?", a: "Yes! All our juices and shakes are made fresh to order with no preservatives." },
    { q: "What are your working hours?", a: "We are open 8 AM to 10 PM every day." },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ backgroundColor: theme.primary, paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontSize: 16 }}>? Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: "bold", color: "#fff" }}>Help & Support</Text>
        <Text style={{ fontSize: 14, color: "#E9D5FF", marginTop: 4 }}>We are here to help you!</Text>
      </View>

      <View style={{ padding: 20 }}>
        <View style={{ backgroundColor: theme.white, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#E9D5FF" }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text, marginBottom: 16 }}>Contact Us</Text>
          <TouchableOpacity onPress={() => Linking.openURL("https://wa.me/919949473727")}
            style={{ backgroundColor: "#25D366", padding: 16, borderRadius: 14, alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Chat on WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL("mailto:support@sermcy.com")}
            style={{ backgroundColor: theme.card, padding: 16, borderRadius: 14, alignItems: "center" }}>
            <Text style={{ color: theme.primary, fontWeight: "bold", fontSize: 16 }}>Email Us</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: theme.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#E9D5FF" }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text, marginBottom: 16 }}>FAQs</Text>
          {faqs.map((faq, i) => (
            <View key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: i < faqs.length - 1 ? 1 : 0, borderBottomColor: "#F3E8FF" }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: theme.text, marginBottom: 6 }}>{faq.q}</Text>
              <Text style={{ fontSize: 13, color: theme.subtext, lineHeight: 20 }}>{faq.a}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
