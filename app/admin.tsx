import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { theme } from "../lib/theme";
import { router } from "expo-router";

const ADMIN_EMAIL = "sermcy@gmail.com";

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [user, setUser] = useState(null);

  const statusColors = {
    pending: { bg: "#FEF3C7", text: "#92400E" },
    confirmed: { bg: "#DBEAFE", text: "#1E40AF" },
    preparing: { bg: "#EDE9FE", text: "#5B21B6" },
    out_for_delivery: { bg: "#D1FAE5", text: "#065F46" },
    delivered: { bg: "#D1FAE5", text: "#065F46" },
  };

  const nextStatus = {
    pending: "confirmed",
    confirmed: "preparing",
    preparing: "out_for_delivery",
    out_for_delivery: "delivered",
  };

  const nextStatusLabel = {
    pending: "Confirm Order",
    confirmed: "Start Preparing",
    preparing: "Out for Delivery",
    out_for_delivery: "Mark Delivered",
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user?.email !== ADMIN_EMAIL) {
        Alert.alert("Access Denied", "Admin only!");
        router.replace("/");
        return;
      }
      fetchData();
    });
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [ordersRes, productsRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("name"),
    ]);
    setOrders(ordersRes.data || []);
    setProducts(productsRes.data || []);
    setLoading(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) Alert.alert("Error", error.message);
    else { fetchData(); Alert.alert("Updated!", "Order status changed to " + newStatus); }
  };

  const toggleStock = async (productId, currentStock) => {
    const newStock = currentStock > 0 ? 0 : 50;
    await supabase.from("products").update({ stock: newStock }).eq("id", productId);
    fetchData();
  };

  const totalRevenue = orders.filter(o => o.status === "delivered").reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;

  if (loading) return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background }}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="light-content" />
      <View style={{ backgroundColor: theme.primary, paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ color: "#E9D5FF", fontSize: 13 }}>Admin Panel</Text>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>Sermcy Dashboard</Text>
          </View>
          <TouchableOpacity onPress={() => router.replace("/")} style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: 10, borderRadius: 12 }}>
            <Text style={{ color: "#fff", fontSize: 13 }}>Home</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", marginTop: 16, gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 14 }}>
            <Text style={{ color: "#E9D5FF", fontSize: 12 }}>Total Revenue</Text>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>Rs.{totalRevenue}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 14 }}>
            <Text style={{ color: "#E9D5FF", fontSize: 12 }}>Pending Orders</Text>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>{pendingOrders}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 14 }}>
            <Text style={{ color: "#E9D5FF", fontSize: 12 }}>Total Orders</Text>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>{orders.length}</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", backgroundColor: theme.white, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#E9D5FF" }}>
        {["orders", "products"].map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
            style={{ flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 12, backgroundColor: activeTab === tab ? theme.primary : "transparent" }}>
            <Text style={{ color: activeTab === tab ? "#fff" : theme.subtext, fontWeight: "600", fontSize: 15, textTransform: "capitalize" }}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {activeTab === "orders" ? (
          orders.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Text style={{ color: theme.subtext, fontSize: 16 }}>No orders yet</Text>
            </View>
          ) : (
            orders.map(order => (
              <View key={order.id} style={{ backgroundColor: theme.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E9D5FF" }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: theme.text }}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                  <View style={{ backgroundColor: statusColors[order.status]?.bg || "#F3F4F6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                    <Text style={{ fontSize: 12, color: statusColors[order.status]?.text || theme.subtext, fontWeight: "600" }}>{order.status}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                  <Text style={{ color: theme.subtext, fontSize: 13 }}>{new Date(order.created_at).toLocaleString("en-IN")}</Text>
                  <Text style={{ fontWeight: "bold", color: theme.primary, fontSize: 16 }}>Rs.{order.total}</Text>
                </View>
                {nextStatus[order.status] && (
                  <TouchableOpacity onPress={() => updateOrderStatus(order.id, nextStatus[order.status])}
                    style={{ backgroundColor: theme.primary, padding: 12, borderRadius: 12, alignItems: "center" }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>{nextStatusLabel[order.status]}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )
        ) : (
          products.map(product => (
            <View key={product.id} style={{ backgroundColor: theme.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E9D5FF", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: theme.text }}>{product.name}</Text>
                <Text style={{ fontSize: 13, color: theme.primary, fontWeight: "600" }}>Rs.{product.price}</Text>
                <Text style={{ fontSize: 12, color: theme.subtext }}>{product.category}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleStock(product.id, product.stock)}
                style={{ backgroundColor: product.stock > 0 ? "#D1FAE5" : "#FEE2E2", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 }}>
                <Text style={{ color: product.stock > 0 ? "#065F46" : "#DC2626", fontWeight: "bold", fontSize: 13 }}>
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
