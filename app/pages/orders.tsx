import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { theme } from "../../lib/theme";
import { router } from "expo-router";

export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("orders").select("*").eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .then(({ data }) => {
            setOrders(data || []);
            setLoading(false);
          });
      }
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="light-content" />
      <View style={{ backgroundColor: theme.primary, paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
          <Text style={{ color: "#E9D5FF", fontSize: 15 }}>{"<"} Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>My Orders</Text>
        <Text style={{ color: "#E9D5FF", fontSize: 13, marginTop: 4 }}>{orders.length} orders total</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {orders.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>??</Text>
              <Text style={{ fontSize: 18, fontWeight: "600", color: theme.text }}>No orders yet</Text>
              <Text style={{ color: theme.subtext, marginTop: 8 }}>Start ordering your favourite juices!</Text>
              <TouchableOpacity onPress={() => router.replace("/")}
                style={{ backgroundColor: theme.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, marginTop: 20 }}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Browse Products</Text>
              </TouchableOpacity>
            </View>
          ) : (
            orders.map(order => (
              <TouchableOpacity key={order.id}
                onPress={() => router.push({ pathname: "/ordertrack", params: { orderId: order.id } })}
                style={{ backgroundColor: theme.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E9D5FF", elevation: 2 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: theme.text }}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: theme.primary }}>Rs.{order.total}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ fontSize: 13, color: theme.subtext }}>{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</Text>
                  <View style={{ backgroundColor: order.status === "delivered" ? "#D1FAE5" : order.status === "out_for_delivery" ? "#DBEAFE" : "#FEF3C7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: order.status === "delivered" ? "#065F46" : order.status === "out_for_delivery" ? "#1E40AF" : "#92400E" }}>{order.status}</Text>
                  </View>
                </View>
                <Text style={{ color: theme.primary, fontSize: 13, marginTop: 8, fontWeight: "600" }}>Track Order {">"}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
