import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { theme } from "../../lib/theme";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Offers() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    supabase.from("coupons").select("*").eq("active", true).then(({ data }) => {
      setCoupons(data || []);
      setLoading(false);
    });
  }, []);

  const handleCopy = (code) => {
    setCopied(code);
    Alert.alert("Copied!", code + " copied. Use at checkout!");
    setTimeout(() => setCopied(""), 3000);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ backgroundColor: theme.primary, paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontSize: 16 }}>? Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: "bold", color: "#fff" }}>Offers & Coupons</Text>
        <Text style={{ fontSize: 14, color: "#E9D5FF", marginTop: 4 }}>Save more on every order!</Text>
      </View>

      <View style={{ padding: 20 }}>
        {loading ? <ActivityIndicator color={theme.primary} /> : (
          coupons.map(coupon => (
            <View key={coupon.id} style={{ backgroundColor: theme.white, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#E9D5FF", borderStyle: "dashed" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text style={{ fontSize: 22, fontWeight: "bold", color: theme.primary }}>{coupon.code}</Text>
                  <Text style={{ fontSize: 14, color: theme.subtext, marginTop: 4 }}>{coupon.description}</Text>
                  <Text style={{ fontSize: 12, color: theme.subtext, marginTop: 4 }}>Valid till: {new Date(coupon.valid_until).toLocaleDateString("en-IN")}</Text>
                </View>
                <View style={{ backgroundColor: theme.card, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}>
                  <Text style={{ fontSize: 20, fontWeight: "bold", color: theme.primary }}>{coupon.discount_percent}%</Text>
                  <Text style={{ fontSize: 10, color: theme.subtext }}>OFF</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleCopy(coupon.code)}
                style={{ backgroundColor: copied === coupon.code ? "#D1FAE5" : theme.primary, padding: 12, borderRadius: 12, alignItems: "center", marginTop: 16 }}>
                <Text style={{ color: copied === coupon.code ? "#065F46" : "#fff", fontWeight: "bold" }}>
                  {copied === coupon.code ? "Copied!" : "Copy Code"}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
