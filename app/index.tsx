import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StatusBar, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useCartStore } from "../lib/cartStore";
import { theme } from "../lib/theme";
import { router } from "expo-router";
import * as Location from "expo-location";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [userName, setUserName] = useState("");
  const [location, setLocation] = useState("Fetching location...");
  const { addToCart, cart } = useCartStore();

  const categories = [
    { id: "all", label: "All", bg: "#7C3AED" },
    { id: "juice", label: "Juices", bg: "#EC4899" },
    { id: "thickshake", label: "Shakes", bg: "#10B981" },
    { id: "icecream", label: "Ice Creams", bg: "#F59E0B" },
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserName(user?.user_metadata?.full_name?.split(" ")[0] || "there");
    });
    supabase.from("products").select("*").then(({ data }) => {
      setProducts(data || []);
      setLoading(false);
    });
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") { setLocation("Location permission denied"); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [address] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (address) {
        const locationText = [address.street, address.district, address.city].filter(Boolean).join(", ");
        setLocation(locationText || "Location found");
      }
    } catch { setLocation("Unable to fetch location"); }
  };

  const filtered = activeCategory === "all" ? products : products.filter(p => p.category === activeCategory);
  const recommended = products.slice(0, 6);
  const getCartQuantity = (id) => cart.find(c => c.id === id)?.quantity || 0;

  const ProductCard = ({ item, horizontal = false }) => (
    <TouchableOpacity onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id } })}
      style={{
        backgroundColor: theme.white, borderRadius: 20, overflow: "hidden",
        shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
        width: horizontal ? 180 : "100%",
        marginRight: horizontal ? 12 : 0,
        marginBottom: horizontal ? 0 : 16,
      }}>
      <Image source={{ uri: item.image_url }} style={{ width: "100%", height: horizontal ? 120 : 180 }} resizeMode="cover" />
      <View style={{ position: "absolute", top: 8, right: 8, backgroundColor: theme.secondary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
        <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>{item.category}</Text>
      </View>
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: horizontal ? 14 : 17, fontWeight: "700", color: theme.text }} numberOfLines={1}>{item.name}</Text>
        <Text style={{ fontSize: 12, color: theme.subtext, marginTop: 2 }} numberOfLines={1}>{item.description}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <Text style={{ fontSize: horizontal ? 16 : 20, fontWeight: "bold", color: theme.primary }}>Rs.{item.price}</Text>
          {getCartQuantity(item.id) > 0 ? (
            <View style={{ flexDirection: "row", backgroundColor: theme.primary, borderRadius: 12, alignItems: "center", paddingHorizontal: 6, paddingVertical: 4 }}>
              <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); useCartStore.getState().decreaseQuantity(item.id); }} style={{ paddingHorizontal: 6 }}>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>-</Text>
              </TouchableOpacity>
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "bold", marginHorizontal: 4 }}>{getCartQuantity(item.id)}</Text>
              <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); addToCart(item); }} style={{ paddingHorizontal: 6 }}>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); addToCart(item); }}
              style={{ backgroundColor: theme.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 }}>
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>Add +</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background }}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      <View style={{ paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: theme.white, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 3 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: theme.subtext }}>Good day, {userName}!</Text>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: theme.primary }}>Sermcy</Text>
            <TouchableOpacity onPress={fetchLocation} style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
              <Text style={{ fontSize: 12, color: theme.primary, fontWeight: "600" }}>?? </Text>
              <Text style={{ fontSize: 12, color: theme.subtext, flex: 1 }} numberOfLines={1}>{location}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ backgroundColor: theme.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
            <Text style={{ fontSize: 12, color: theme.primary, fontWeight: "600" }}>Delivery 20 min</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push("/search")}
          style={{ flexDirection: "row", alignItems: "center", backgroundColor: theme.background, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: "#E9D5FF" }}>
          <Text style={{ fontSize: 15, color: theme.subtext }}>Search juices, shakes, ice creams...</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 20, paddingHorizontal: 20, marginBottom: 8 }}>
        <View style={{ backgroundColor: theme.primary, borderRadius: 20, padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ color: "#fff", fontSize: 12, opacity: 0.8 }}>Limited time offer</Text>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold", marginTop: 4 }}>20% OFF</Text>
            <Text style={{ color: "#fff", fontSize: 13, opacity: 0.9, marginTop: 2 }}>On all thick shakes today!</Text>
          </View>
          <View style={{ backgroundColor: "rgba(255,255,255,0.2)", width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "bold", textAlign: "center" }}>SHAKE{"\n"}SALE</Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 20, paddingLeft: 20, marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text, marginBottom: 14 }}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(cat => (
            <TouchableOpacity key={cat.id} onPress={() => setActiveCategory(cat.id)} style={{ alignItems: "center", marginRight: 20 }}>
              <View style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: activeCategory === cat.id ? cat.bg : theme.card, justifyContent: "center", alignItems: "center", marginBottom: 6, borderWidth: activeCategory === cat.id ? 0 : 1, borderColor: "#E9D5FF" }}>
                <Text style={{ color: activeCategory === cat.id ? "#fff" : cat.bg, fontSize: 13, fontWeight: "bold", textAlign: "center" }}>{cat.label}</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: "600", color: activeCategory === cat.id ? theme.primary : theme.subtext }}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {activeCategory === "all" && (
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 14 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text }}>Recommended</Text>
            <TouchableOpacity onPress={() => router.push("/search")}>
              <Text style={{ fontSize: 13, color: theme.primary, fontWeight: "600" }}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={recommended}
            keyExtractor={item => item.id + "rec"}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
            renderItem={({ item }) => <ProductCard item={item} horizontal={true} />}
          />
        </View>
      )}

      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text, marginBottom: 14 }}>
          {activeCategory === "all" ? "All Products" : categories.find(c => c.id === activeCategory)?.label}
        </Text>
        {filtered.map(item => <ProductCard key={item.id} item={item} />)}
        {filtered.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Text style={{ color: theme.subtext, fontSize: 16, marginTop: 8 }}>No products found</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
