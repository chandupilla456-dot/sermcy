import { View, Text, Image, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useCartStore } from "../../lib/cartStore";
import { theme } from "../../lib/theme";

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const { addToCart, cart, decreaseQuantity } = useCartStore();
  const getQty = (pid) => cart.find(c => c.id === pid)?.quantity || 0;

  useEffect(() => {
    supabase.from("products").select("*").eq("id", id).single().then(({ data }) => {
      setProduct(data);
      if (data) {
        supabase.from("products").select("*").eq("category", data.category).neq("id", id).limit(6)
          .then(({ data: sim }) => setSimilar(sim || []));
      }
    });
  }, [id]);

  if (!product) return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background }}>
      <Text style={{ color: theme.subtext }}>Loading...</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: theme.white }}>
          <TouchableOpacity onPress={() => router.back()}
            style={{ position: "absolute", top: 50, left: 16, zIndex: 10, backgroundColor: "rgba(0,0,0,0.3)", width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "#fff", fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <Image source={{ uri: product.image_url }} style={{ width: "100%", height: 300 }} resizeMode="cover" />
        </View>

        <View style={{ backgroundColor: theme.white, padding: 20, marginBottom: 12 }}>
          <View style={{ backgroundColor: theme.card, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: "flex-start", marginBottom: 8 }}>
            <Text style={{ fontSize: 12, color: theme.primary, fontWeight: "600" }}>{product.category?.toUpperCase()}</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: theme.text }}>{product.name}</Text>
          <Text style={{ fontSize: 14, color: theme.subtext, marginTop: 6, lineHeight: 22 }}>{product.description}</Text>

          <View style={{ padding: 14, backgroundColor: "#D1FAE5", borderRadius: 14, marginTop: 16 }}>
            <Text style={{ fontSize: 14, color: "#065F46" }}>Fresh - Made to order - No preservatives</Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
            <View>
              <Text style={{ fontSize: 28, fontWeight: "bold", color: theme.primary }}>Rs.{product.price}</Text>
              <Text style={{ fontSize: 13, color: theme.subtext }}>Inclusive of all taxes</Text>
            </View>
            {getQty(product.id) > 0 ? (
              <View style={{ flexDirection: "row", backgroundColor: theme.primary, borderRadius: 16, alignItems: "center", paddingHorizontal: 8, paddingVertical: 8 }}>
                <TouchableOpacity onPress={() => decreaseQuantity(product.id)} style={{ paddingHorizontal: 12 }}>
                  <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>-</Text>
                </TouchableOpacity>
                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginHorizontal: 8 }}>{getQty(product.id)}</Text>
                <TouchableOpacity onPress={() => addToCart(product)} style={{ paddingHorizontal: 12 }}>
                  <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => addToCart(product)}
                style={{ backgroundColor: theme.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 }}>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>Add to Cart</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ backgroundColor: theme.white, padding: 20, marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text, marginBottom: 16 }}>Product Details</Text>
          {[
            { label: "Category", value: product.category },
            { label: "Price", value: "Rs." + product.price },
            { label: "Availability", value: product.stock > 0 ? "In Stock" : "Out of Stock" },
            { label: "Delivery", value: "20-30 minutes" },
          ].map((row, i) => (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: i < 3 ? 1 : 0, borderBottomColor: "#F3E8FF" }}>
              <Text style={{ color: theme.subtext }}>{row.label}</Text>
              <Text style={{ fontWeight: "600", color: theme.text }}>{row.value}</Text>
            </View>
          ))}
        </View>

        {similar.length > 0 && (
          <View style={{ backgroundColor: theme.white, padding: 20, marginBottom: 80 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text, marginBottom: 16 }}>Similar Products</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {similar.map(sim => (
                <TouchableOpacity key={sim.id} onPress={() => router.push({ pathname: "/product/[id]", params: { id: sim.id } })}
                  style={{ width: 150, marginRight: 12, backgroundColor: theme.background, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#E9D5FF" }}>
                  <Image source={{ uri: sim.image_url }} style={{ width: "100%", height: 110 }} resizeMode="cover" />
                  <View style={{ padding: 10 }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: theme.text }} numberOfLines={1}>{sim.name}</Text>
                    <Text style={{ fontSize: 14, fontWeight: "bold", color: theme.primary, marginTop: 4 }}>Rs.{sim.price}</Text>
                    <TouchableOpacity onPress={() => addToCart(sim)}
                      style={{ backgroundColor: theme.primary, padding: 6, borderRadius: 8, alignItems: "center", marginTop: 8 }}>
                      <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>Add +</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {getQty(product.id) > 0 && (
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: theme.white, padding: 16, borderTopWidth: 1, borderTopColor: "#E9D5FF" }}>
          <TouchableOpacity onPress={() => router.push("/cart")}
            style={{ backgroundColor: theme.primary, padding: 16, borderRadius: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ backgroundColor: "rgba(255,255,255,0.3)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>{getQty(product.id)} item</Text>
            </View>
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>View Cart</Text>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Rs.{product.price * getQty(product.id)}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}