import { Tabs, router } from "expo-router";
import { useCartStore } from "../lib/cartStore";
import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { theme } from "../lib/theme";

export default function Layout() {
  const cart = useCartStore(state => state.cart);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoading(false);
      if (!session) router.replace("/login");
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });
  }, []);

  if (loading) return null;

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.primary,
      tabBarStyle: { backgroundColor: theme.white, borderTopColor: "#E9D5FF", paddingBottom: 8, height: 60 },
      tabBarLabelStyle: { fontSize: 12, fontWeight: "600" }
    }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => (
        <View style={{ width: 28, height: 28, justifyContent: "center", alignItems: "center" }}>
          <View style={{ width: 18, height: 16, borderWidth: 2, borderColor: color, borderRadius: 2 }} />
        </View>
      )}} />
      <Tabs.Screen name="search" options={{ title: "Search", tabBarIcon: ({ color }) => (
        <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: color }} />
      )}} />
      <Tabs.Screen name="cart" options={{
        title: "Cart",
        tabBarIcon: ({ color }) => (
          <View>
            <View style={{ width: 20, height: 18, borderWidth: 2, borderColor: color, borderRadius: 3 }} />
            {totalItems > 0 && (
              <View style={{ position: "absolute", top: -6, right: -8, backgroundColor: theme.secondary, borderRadius: 8, width: 16, height: 16, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>{totalItems}</Text>
              </View>
            )}
          </View>
        )
      }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color }) => (
        <View style={{ alignItems: "center" }}>
          <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: color, marginBottom: 2 }} />
          <View style={{ width: 20, height: 8, borderTopLeftRadius: 10, borderTopRightRadius: 10, borderWidth: 2, borderColor: color }} />
        </View>
      )}} />
      <Tabs.Screen name="payment" options={{ href: null }} />
      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="signup" options={{ href: null }} />
      <Tabs.Screen name="ordertrack" options={{ href: null }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
      <Tabs.Screen name="rider" options={{ href: null }} />
      <Tabs.Screen name="rider-signup" options={{ href: null }} />
      <Tabs.Screen name="product/[id]" options={{ href: null }} />
      <Tabs.Screen name="pages/help" options={{ href: null }} />
      <Tabs.Screen name="pages/terms" options={{ href: null }} />
      <Tabs.Screen name="pages/privacy" options={{ href: null }} />
      <Tabs.Screen name="pages/offers" options={{ href: null }} />
      <Tabs.Screen name="pages/addresses" options={{ href: null }} />
      <Tabs.Screen name="pages/orders" options={{ href: null }} />
    </Tabs>
  );
}
