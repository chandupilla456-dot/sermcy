import { View, Text, ScrollView, StatusBar, ActivityIndicator, TouchableOpacity, Linking, Alert } from "react-native";
import { useEffect, useState, useRef } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../lib/supabase";
import { theme } from "../lib/theme";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";

export default function OrderTrack() {
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const locationInterval = useRef(null);

  const statusSteps = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];
  const statusLabels = {
    pending: "Order Placed",
    confirmed: "Order Confirmed",
    preparing: "Preparing Your Order",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered"
  };

  useEffect(() => {
    setupLocation();
    fetchOrder();
    const sub = supabase.channel("track-" + orderId)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        payload => setOrder(payload.new))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "riders" },
        payload => {
          if (payload.new?.current_lat) {
            setRiderLocation({ latitude: parseFloat(payload.new.current_lat), longitude: parseFloat(payload.new.current_lng) });
          }
        })
      .subscribe();
    return () => {
      supabase.removeChannel(sub);
      if (locationInterval.current) clearInterval(locationInterval.current);
    };
  }, [orderId]);

  const setupLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      setCustomerLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      locationInterval.current = setInterval(async () => {
        const updated = await Location.getCurrentPositionAsync({});
        setCustomerLocation({ latitude: updated.coords.latitude, longitude: updated.coords.longitude });
      }, 15000);
    } catch (e) { console.log(e); }
  };

  const fetchOrder = async () => {
    const { data } = await supabase.from("orders").select("*, riders(current_lat, current_lng, name, phone)").eq("id", orderId).single();
    setOrder(data);
    if (data?.riders?.current_lat) {
      setRiderLocation({ latitude: parseFloat(data.riders.current_lat), longitude: parseFloat(data.riders.current_lng) });
    }
    setLoading(false);
  };

  if (loading) return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background }}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );

  const currentStep = statusSteps.indexOf(order?.status || "pending");

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="light-content" />
      <View style={{ backgroundColor: theme.primary, paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
          <Text style={{ color: "#E9D5FF", fontSize: 15 }}>{"<"} Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>Track Order</Text>
        <Text style={{ fontSize: 14, color: "#E9D5FF", marginTop: 4 }}>#{String(orderId).slice(0, 8).toUpperCase()}</Text>
      </View>

      <View style={{ padding: 20 }}>
        <View style={{ backgroundColor: theme.white, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E9D5FF" }}>
          <Text style={{ fontSize: 14, color: theme.subtext }}>Estimated Delivery</Text>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: theme.primary, marginBottom: 8 }}>20-30 minutes</Text>
          <View style={{ backgroundColor: order?.status === "delivered" ? "#D1FAE5" : "#FEF3C7", padding: 12, borderRadius: 12 }}>
            <Text style={{ fontWeight: "700", color: order?.status === "delivered" ? "#065F46" : "#92400E", fontSize: 15 }}>
              {statusLabels[order?.status || "pending"]}
            </Text>
          </View>
        </View>

        {customerLocation && (
          <View style={{ borderRadius: 20, overflow: "hidden", marginBottom: 16, height: 220 }}>
            <MapView style={{ flex: 1 }}
              initialRegion={{ latitude: customerLocation.latitude, longitude: customerLocation.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }}>
              <Marker coordinate={customerLocation} title="Your Location" pinColor={theme.primary} />
              {riderLocation && <Marker coordinate={riderLocation} title="Rider" pinColor="#F59E0B" />}
              {riderLocation && customerLocation && (
                <Polyline coordinates={[riderLocation, customerLocation]} strokeColor={theme.primary} strokeWidth={3} lineDashPattern={[8, 4]} />
              )}
            </MapView>
          </View>
        )}

        {order?.riders && order?.status === "out_for_delivery" && (
          <View style={{ backgroundColor: theme.white, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E9D5FF" }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text, marginBottom: 12 }}>Your Rider</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: "600", color: theme.text }}>{order.riders.name}</Text>
                <Text style={{ fontSize: 13, color: theme.subtext }}>On the way to you!</Text>
              </View>
              <TouchableOpacity onPress={() => Linking.openURL("tel:+91" + order.riders.phone)}
                style={{ backgroundColor: "#10B981", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14 }}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Call Rider</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {order?.status === "delivered" && (
          <View style={{ backgroundColor: "#D1FAE5", borderRadius: 20, padding: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#065F46", marginBottom: 8 }}>Order Delivered!</Text>
            <Text style={{ color: "#065F46", fontSize: 14 }}>Thank you for ordering from Sermcy. Enjoy your drink!</Text>
          </View>
        )}

        {order?.status !== "delivered" && (
          <View style={{ backgroundColor: theme.white, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#E9D5FF" }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text, marginBottom: 16 }}>Need Help?</Text>
            <TouchableOpacity onPress={() => Linking.openURL("https://wa.me/919949473727?text=Hi, I need help with my order #" + String(orderId).slice(0, 8).toUpperCase())}
              style={{ backgroundColor: "#25D366", padding: 14, borderRadius: 14, alignItems: "center", marginBottom: 10 }}>
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>Chat on WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL("tel:+919949473727")}
              style={{ backgroundColor: theme.card, padding: 14, borderRadius: 14, alignItems: "center", marginBottom: 10 }}>
              <Text style={{ color: theme.primary, fontWeight: "bold", fontSize: 15 }}>Call Us</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert("Order Issue", "What is the issue?", [
              { text: "Order not received", onPress: () => Linking.openURL("https://wa.me/919949473727?text=My order #" + String(orderId).slice(0, 8).toUpperCase() + " not received") },
              { text: "Wrong items", onPress: () => Linking.openURL("https://wa.me/919949473727?text=Wrong items in order #" + String(orderId).slice(0, 8).toUpperCase()) },
              { text: "Cancel", style: "cancel" }
            ])} style={{ backgroundColor: "#FEE2E2", padding: 14, borderRadius: 14, alignItems: "center" }}>
              <Text style={{ color: "#DC2626", fontWeight: "bold", fontSize: 15 }}>Report Issue</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ backgroundColor: theme.white, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#E9D5FF" }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text, marginBottom: 20 }}>Order Status</Text>
          {statusSteps.map((step, index) => (
            <View key={step} style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View style={{ alignItems: "center", marginRight: 16 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: index <= currentStep ? theme.primary : "#E9D5FF", justifyContent: "center", alignItems: "center" }}>
                  <Text style={{ color: index <= currentStep ? "#fff" : theme.subtext, fontWeight: "bold" }}>
                    {index <= currentStep ? "v" : String(index + 1)}
                  </Text>
                </View>
                {index < statusSteps.length - 1 && (
                  <View style={{ width: 2, height: 40, backgroundColor: index < currentStep ? theme.primary : "#E9D5FF" }} />
                )}
              </View>
              <View style={{ paddingTop: 8, paddingBottom: index < statusSteps.length - 1 ? 40 : 0 }}>
                <Text style={{ fontSize: 15, fontWeight: index <= currentStep ? "700" : "400", color: index <= currentStep ? theme.text : theme.subtext }}>
                  {statusLabels[step]}
                </Text>
                {index === currentStep && <Text style={{ fontSize: 12, color: theme.primary, marginTop: 2 }}>Current Status</Text>}
              </View>
            </View>
          ))}
        </View>

        <View style={{ backgroundColor: theme.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#E9D5FF" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ color: theme.subtext }}>Order ID</Text>
            <Text style={{ fontWeight: "600", color: theme.text }}>#{String(orderId).slice(0, 8).toUpperCase()}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ color: theme.subtext }}>Total</Text>
            <Text style={{ fontWeight: "700", color: theme.primary }}>Rs.{order?.total}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: theme.subtext }}>Payment</Text>
            <Text style={{ fontWeight: "600", color: theme.text }}>{order?.payment_method === "cod" ? "Cash on Delivery" : "Online Paid"}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
