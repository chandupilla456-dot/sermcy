import { View, Text, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useCartStore } from "../lib/cartStore";
import { theme } from "../lib/theme";
import { router } from "expo-router";

export default function Search() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const { addToCart, cart } = useCartStore();

  const filters = [
    { id: "all", label: "All" },
    { id: "juice", label: "Juices" },
    { id: "thickshake", label: "Shakes" },
    { id: "icecream", label: "Ice Creams" },
  ];

  useEffect(() => {
    supabase.from("products").select("*").then(({ data }) => {
      setProducts(data || []);
      setLoading(false);
    });
  }, []);

  const getQty = (id) => cart.find(c => c.id === id)?.quantity || 0;

  const filtered = products.filter(p => {
    const matchQuery = p.name.toLowerCase().includes(query.toLowerCase());
    const matchFilter = activeFilter === "all" || p.category === activeFilter;
    return matchQuery && matchFilter;
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ backgroundColor: theme.white, paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 3 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: theme.primary, marginBottom: 12 }}>Search</Text>
        <TextInput
          placeholder="Search juices, shakes, ice creams..."
          value={query}
          onChangeText={setQuery}
          autoFocus={false}
          style={{ backgroundColor: theme.background, padding: 14, borderRadius: 14, fontSize: 15, borderWidth: 1, borderColor: "#E9D5FF", marginBottom: 12 }}
        />
        <View style={{ flexDirection: "row" }}>
          {filters.map(f => (
            <TouchableOpacity key={f.id} onPress={() => setActiveFilter(f.id)}
              style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: activeFilter === f.id ? theme.primary : theme.card }}>
              <Text style={{ color: activeFilter === f.id ? "#fff" : theme.subtext, fontSize: 13, fontWeight: "600" }}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>??</Text>
              <Text style={{ color: theme.subtext, fontSize: 16 }}>No products found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id } })}
              style={{ flexDirection: "row", backgroundColor: theme.white, borderRadius: 16, marginBottom: 12, overflow: "hidden", borderWidth: 1, borderColor: "#E9D5FF", elevation: 2 }}>
              <Image source={{ uri: item.image_url }} style={{ width: 100, height: 100 }} resizeMode="cover" />
              <View style={{ flex: 1, padding: 12, justifyContent: "space-between" }}>
                <View>
                  <View style={{ backgroundColor: theme.card, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, alignSelf: "flex-start", marginBottom: 4 }}>
                    <Text style={{ fontSize: 10, color: theme.primary, fontWeight: "600" }}>{item.category}</Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: theme.text }}>{item.name}</Text>
                  <Text style={{ fontSize: 12, color: theme.subtext, marginTop: 2 }} numberOfLines={1}>{item.description}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.primary }}>Rs.{item.price}</Text>
                  {getQty(item.id) > 0 ? (
                    <View style={{ flexDirection: "row", backgroundColor: theme.primary, borderRadius: 10, alignItems: "center" }}>
                      <TouchableOpacity onPress={() => useCartStore.getState().decreaseQuantity(item.id)} style={{ paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>-</Text>
                      </TouchableOpacity>
                      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>{getQty(item.id)}</Text>
                      <TouchableOpacity onPress={() => addToCart(item)} style={{ paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => addToCart(item)}
                      style={{ backgroundColor: theme.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 }}>
                      <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>Add +</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
