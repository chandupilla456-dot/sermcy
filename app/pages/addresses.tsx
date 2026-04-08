import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { theme } from "../../lib/theme";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import * as Location from "expo-location";

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("Home");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const fetchAddresses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id);
      setAddresses(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAddresses(); }, []);

  const fetchCurrentLocation = async () => {
    setFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") { Alert.alert("Permission denied", "Allow location access"); setFetchingLocation(false); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const [addr] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (addr) {
        const fullAddress = [addr.name, addr.street, addr.district, addr.city, addr.postalCode].filter(Boolean).join(", ");
        setAddress(fullAddress);
      }
    } catch { Alert.alert("Error", "Could not fetch location"); }
    setFetchingLocation(false);
  };

  const handleSave = async () => {
    if (!address) return Alert.alert("Error", "Enter address");
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("addresses").insert({ user_id: user.id, label, address });
    setSaving(false);
    if (error) Alert.alert("Error", error.message);
    else { setAdding(false); setAddress(""); fetchAddresses(); Alert.alert("Saved!", "Address added successfully"); }
  };

  const handleDelete = async (id) => {
    Alert.alert("Delete", "Remove this address?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await supabase.from("addresses").delete().eq("id", id); fetchAddresses(); } }
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ backgroundColor: theme.primary, paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontSize: 16 }}>{"<"} Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: "bold", color: "#fff" }}>Saved Addresses</Text>
      </View>

      <View style={{ padding: 20 }}>
        {loading ? <ActivityIndicator color={theme.primary} /> : (
          <>
            {addresses.length === 0 && !adding && (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Text style={{ fontSize: 40, marginBottom: 8 }}>??</Text>
                <Text style={{ color: theme.subtext, fontSize: 16 }}>No addresses saved</Text>
              </View>
            )}

            {addresses.map(addr => (
              <View key={addr.id} style={{ backgroundColor: theme.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E9D5FF", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <View style={{ backgroundColor: theme.card, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, alignSelf: "flex-start", marginBottom: 6 }}>
                    <Text style={{ fontSize: 12, color: theme.primary, fontWeight: "600" }}>{addr.label}</Text>
                  </View>
                  <Text style={{ fontSize: 14, color: theme.text }}>{addr.address}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(addr.id)} style={{ marginLeft: 12 }}>
                  <Text style={{ color: "#DC2626", fontSize: 16, fontWeight: "bold" }}>X</Text>
                </TouchableOpacity>
              </View>
            ))}

            {adding ? (
              <View style={{ backgroundColor: theme.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#E9D5FF" }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text, marginBottom: 16 }}>Add New Address</Text>
                <Text style={{ fontSize: 13, color: theme.subtext, marginBottom: 6 }}>Label</Text>
                <View style={{ flexDirection: "row", marginBottom: 16 }}>
                  {["Home", "Work", "Other"].map(l => (
                    <TouchableOpacity key={l} onPress={() => setLabel(l)}
                      style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginRight: 8, backgroundColor: label === l ? theme.primary : theme.card }}>
                      <Text style={{ color: label === l ? "#fff" : theme.subtext, fontWeight: "600" }}>{l}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity onPress={fetchCurrentLocation} disabled={fetchingLocation}
                  style={{ backgroundColor: theme.card, padding: 12, borderRadius: 12, alignItems: "center", marginBottom: 12, flexDirection: "row", justifyContent: "center" }}>
                  {fetchingLocation ? <ActivityIndicator color={theme.primary} size="small" /> : <Text style={{ color: theme.primary, fontWeight: "600" }}>?? Use Current Location</Text>}
                </TouchableOpacity>

                <Text style={{ fontSize: 13, color: theme.subtext, marginBottom: 6 }}>Full Address</Text>
                <TextInput value={address} onChangeText={setAddress} multiline numberOfLines={3}
                  placeholder="House no, Street, Area, City, Pincode"
                  style={{ backgroundColor: theme.background, padding: 14, borderRadius: 12, fontSize: 14, marginBottom: 16, borderWidth: 1, borderColor: "#E9D5FF", height: 80 }} />
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity onPress={handleSave} disabled={saving}
                    style={{ flex: 1, backgroundColor: theme.primary, padding: 14, borderRadius: 14, alignItems: "center", marginRight: 8 }}>
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "bold" }}>Save Address</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setAdding(false)}
                    style={{ backgroundColor: theme.card, padding: 14, borderRadius: 14, alignItems: "center", paddingHorizontal: 20 }}>
                    <Text style={{ color: theme.subtext, fontWeight: "bold" }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setAdding(true)}
                style={{ backgroundColor: theme.primary, padding: 16, borderRadius: 16, alignItems: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>+ Add New Address</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}
