import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { theme } from "../lib/theme";
import { router } from "expo-router";
import * as Location from "expo-location";

export default function Rider() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [rider, setRider] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user?.user_metadata?.role !== "rider") {
        Alert.alert("Access Denied", "Rider account required!");
        router.replace("/");
        return;
      }
      supabase.from("riders").select("*").eq("user_id", user.id).single()
        .then(({ data }) => { setRider(data); setIsOnline(data?.is_active ?? true); });
      fetchOrders();
      startLocationTracking(user.id);
    });
  }, []);

  const startLocationTracking = async (userId) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 15000, distanceInterval: 20 },
        async (loc) => {
          await supabase.from("riders").update({
            current_lat: loc.coords.latitude,
            current_lng: loc.coords.longitude
          }).eq("user_id", userId);
        }
      );
    } catch (e) { console.log("Location error:", e); }
  };

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders")
      .select("*")
      .in("status", ["confirmed", "preparing", "out_for_delivery"])
      .order("created_at", { ascending: false });
    setOrders(data || []);
    const { data: delivered } = await supabase.from("orders").select("total").eq("status", "delivered");
    setEarnings(delivered?.reduce((sum, o) => sum + (o.total * 0.2), 0) || 0);
    setLoading(false);
  };

  const updateStatus = async (orderId, status) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    fetchOrders();
    Alert.alert("Updated!", "Order marked as " + status);
  };

  const toggleOnline = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    if (rider) await supabase.from("riders").update({ is_active: newStatus }).eq("id", rider.id);
  };

  if (loading) return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background }}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="light-content" />
      <View style={{ backgroundColor: theme.primary, paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <View>
            <Text style={{ color: "#E9D5FF", fontSize: 13 }}>Rider Panel</Text>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>{rider?.name || user?.user_metadata?.full_name || "Rider"}</Text>
            <Text style={{ color: "#E9D5FF", fontSize: 13 }}>+91 {rider?.phone || user?.user_metadata?.phone_number}</Text>
          </View>
          <TouchableOpacity onPress={toggleOnline}
            style={{ backgroundColor: isOnline ? "#10B981" : "#EF4444", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 }}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>{isOnline ? "Online" : "Offline"}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 14 }}>
            <Text style={{ color: "#E9D5FF", fontSize: 12 }}>Active Orders</Text>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>{orders.length}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 14 }}>
            <Text style={{ color: "#E9D5FF", fontSize: 12 }}>Earnings (20%)</Text>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>Rs.{Math.round(earnings)}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={fetchOrders} style={{ backgroundColor: theme.card, padding: 12, borderRadius: 14, alignItems: "center", marginBottom: 16 }}>
          <Text style={{ color: theme.primary, fontWeight: "600" }}>Refresh Orders</Text>
        </TouchableOpacity>

        {orders.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>??</Text>
            <Text style={{ fontSize: 18, fontWeight: "600", color: theme.text }}>No active orders</Text>
            <Text style={{ color: theme.subtext, marginTop: 8 }}>Stay online to receive orders</Text>
          </View>
        ) : (
          orders.map(order => (
            <View key={order.id} style={{ backgroundColor: theme.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E9D5FF", elevation: 2 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text }}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: theme.primary }}>Rs.{order.total}</Text>
              </View>
              <View style={{ backgroundColor: theme.background, padding: 12, borderRadius: 12, marginBottom: 12 }}>
                <Text style={{ fontSize: 13, color: theme.subtext }}>Time: {new Date(order.created_at).toLocaleTimeString("en-IN")}</Text>
                <Text style={{ fontSize: 13, color: theme.subtext, marginTop: 4 }}>Payment: Cash on Delivery</Text>
                {order.delivery_address && (
                  <Text style={{ fontSize: 14, color: theme.text, marginTop: 6, fontWeight: "600" }}>Deliver to: {order.delivery_address}</Text>
                )}
              </View>
              <View style={{ backgroundColor: "#FEF3C7", padding: 10, borderRadius: 10, marginBottom: 12 }}>
                <Text style={{ color: "#92400E", fontWeight: "600" }}>Status: {order.status}</Text>
              </View>
              {order.status === "confirmed" && (
                <TouchableOpacity onPress={() => updateStatus(order.id, "preparing")}
                  style={{ backgroundColor: theme.primary, padding: 14, borderRadius: 12, alignItems: "center" }}>
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>Start Preparing</Text>
                </TouchableOpacity>
              )}
              {order.status === "preparing" && (
                <TouchableOpacity onPress={() => updateStatus(order.id, "out_for_delivery")}
                  style={{ backgroundColor: "#F59E0B", padding: 14, borderRadius: 12, alignItems: "center" }}>
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>Pick Up - Out for Delivery</Text>
                </TouchableOpacity>
              )}
              {order.status === "out_for_delivery" && (
                <TouchableOpacity onPress={() => updateStatus(order.id, "delivered")}
                  style={{ backgroundColor: "#10B981", padding: 14, borderRadius: 12, alignItems: "center" }}>
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>Mark as Delivered</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <View style={{ backgroundColor: theme.white, padding: 16, borderTopWidth: 1, borderTopColor: "#E9D5FF" }}>
        <TouchableOpacity onPress={() => supabase.auth.signOut().then(() => router.replace("/login"))}
          style={{ backgroundColor: "#FEE2E2", padding: 14, borderRadius: 14, alignItems: "center" }}>
          <Text style={{ color: "#DC2626", fontWeight: "bold" }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
