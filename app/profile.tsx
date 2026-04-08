import { View, Text, TouchableOpacity, ScrollView, StatusBar, TextInput, Alert, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { router } from "expo-router";
import { theme } from "../lib/theme";

const ADMIN_EMAIL = "sermcy@gmail.com";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setName(user?.user_metadata?.full_name || "");
      setPhone(user?.user_metadata?.phone_number || "");
      setIsAdmin(user?.email === ADMIN_EMAIL);
      if (user) {
        supabase.from("orders").select("*").eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .then(({ data }) => setOrders(data || []));
      }
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: name, phone_number: phone } });
    setLoading(false);
    if (error) Alert.alert("Error", error.message);
    else { setEditing(false); Alert.alert("Success", "Profile updated!"); }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: async () => { await supabase.auth.signOut(); router.replace("/login"); } }
    ]);
  };

  const MenuItem = ({ title, subtitle, onPress, color = theme.text }) => (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3E8FF" }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color }}>{title}</Text>
        {subtitle && <Text style={{ fontSize: 12, color: theme.subtext, marginTop: 2 }}>{subtitle}</Text>}
      </View>
      <Text style={{ color: theme.subtext, fontSize: 18 }}>{">"}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="light-content" />
      <View style={{ backgroundColor: theme.primary, paddingTop: 50, paddingBottom: 30, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", marginRight: 16 }}>
            <Text style={{ fontSize: 32, fontWeight: "bold", color: theme.primary }}>{(name || "U")[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#fff" }}>{name || "User"}</Text>
            <Text style={{ fontSize: 14, color: "#E9D5FF", marginTop: 2 }}>{user?.email}</Text>
            <Text style={{ fontSize: 13, color: "#E9D5FF", marginTop: 2 }}>+91 {phone || "Add phone"}</Text>
            {isAdmin && (
              <View style={{ backgroundColor: "#FFD700", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, alignSelf: "flex-start", marginTop: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: "bold", color: "#000" }}>ADMIN</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => setEditing(!editing)} style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: 10, borderRadius: 12 }}>
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>{editing ? "Cancel" : "Edit"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {editing && (
          <View style={{ backgroundColor: theme.white, borderRadius: 20, padding: 20, marginTop: 16, borderWidth: 1, borderColor: "#E9D5FF" }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text, marginBottom: 16 }}>Edit Profile</Text>
            <Text style={{ fontSize: 13, color: theme.subtext, marginBottom: 4 }}>Full Name</Text>
            <TextInput value={name} onChangeText={setName} style={{ backgroundColor: theme.background, padding: 14, borderRadius: 12, fontSize: 15, marginBottom: 12, borderWidth: 1, borderColor: "#E9D5FF" }} />
            <Text style={{ fontSize: 13, color: theme.subtext, marginBottom: 4 }}>Phone Number</Text>
            <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} style={{ backgroundColor: theme.background, padding: 14, borderRadius: 12, fontSize: 15, marginBottom: 16, borderWidth: 1, borderColor: "#E9D5FF" }} />
            <TouchableOpacity onPress={handleSave} disabled={loading} style={{ backgroundColor: theme.primary, padding: 14, borderRadius: 14, alignItems: "center" }}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        )}

        {isAdmin && (
          <TouchableOpacity onPress={() => router.push("/admin")}
            style={{ backgroundColor: "#FFD700", padding: 16, borderRadius: 16, alignItems: "center", marginTop: 16 }}>
            <Text style={{ color: "#000", fontWeight: "bold", fontSize: 16 }}>Admin Dashboard</Text>
          </TouchableOpacity>
        )}

        <View style={{ backgroundColor: theme.white, borderRadius: 20, padding: 20, marginTop: 16, borderWidth: 1, borderColor: "#E9D5FF" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text }}>My Orders</Text>
            <TouchableOpacity onPress={() => router.push("/pages/orders")}>
              <Text style={{ fontSize: 13, color: theme.primary, fontWeight: "600" }}>View all {">"}</Text>
            </TouchableOpacity>
          </View>
          {orders.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <Text style={{ color: theme.subtext }}>No orders yet</Text>
            </View>
          ) : (
            orders.slice(0, 3).map(order => (
              <TouchableOpacity key={order.id}
                onPress={() => router.push({ pathname: "/ordertrack", params: { orderId: order.id } })}
                style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3E8FF" }}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: theme.text }}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                  <Text style={{ fontSize: 12, color: theme.subtext }}>{new Date(order.created_at).toLocaleDateString("en-IN")}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 15, fontWeight: "bold", color: theme.primary }}>Rs.{order.total}</Text>
                  <View style={{ backgroundColor: "#FEF3C7", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4 }}>
                    <Text style={{ fontSize: 11, color: "#92400E", fontWeight: "600" }}>{order.status}</Text>
                  </View>
                </View>
                <Text style={{ color: theme.subtext, marginLeft: 8, fontSize: 18 }}>{">"}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ backgroundColor: theme.white, borderRadius: 20, padding: 20, marginTop: 16, borderWidth: 1, borderColor: "#E9D5FF" }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text, marginBottom: 8 }}>My Account</Text>
          <MenuItem title="Saved Addresses" subtitle="Manage delivery addresses" onPress={() => router.push("/pages/addresses")} />
          <MenuItem title="Payment Methods" subtitle="Cash on Delivery" onPress={() => Alert.alert("Coming Soon", "UPI & Card payments coming with Razorpay!")} />
          <MenuItem title="Offers & Coupons" subtitle="Check latest deals" onPress={() => router.push("/pages/offers")} />
          <MenuItem title="Rate the App" subtitle="Share your feedback" onPress={() => Alert.alert("Thank You!", "Play Store rating coming soon!")} />
        </View>

        <View style={{ backgroundColor: theme.white, borderRadius: 20, padding: 20, marginTop: 16, borderWidth: 1, borderColor: "#E9D5FF" }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text, marginBottom: 8 }}>Support</Text>
          <MenuItem title="Help & Support" subtitle="FAQs & Contact us" onPress={() => router.push("/pages/help")} />
          <MenuItem title="Terms & Conditions" onPress={() => router.push("/pages/terms")} />
          <MenuItem title="Privacy Policy" onPress={() => router.push("/pages/privacy")} />
        </View>

        <TouchableOpacity onPress={handleLogout} style={{ backgroundColor: "#FEE2E2", padding: 16, borderRadius: 16, alignItems: "center", marginTop: 16 }}>
          <Text style={{ color: "#DC2626", fontWeight: "bold", fontSize: 16 }}>Logout</Text>
        </TouchableOpacity>

        <Text style={{ textAlign: "center", color: theme.subtext, fontSize: 12, marginTop: 20 }}>Sermcy v1.0.0 - Made with love</Text>
      </View>
    </ScrollView>
  );
}
