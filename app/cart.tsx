import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { useCartStore } from "../lib/cartStore";
import { router } from "expo-router";

export default function Cart() {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, getTotal, clearCart } = useCartStore();

  const handleCheckout = () => {
    if (cart.length === 0) return Alert.alert("Cart Empty", "Add items first");
    router.push("/payment");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 50, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}>Your Cart</Text>

      {cart.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 18, color: "gray" }}>Cart is Empty ??</Text>
          <TouchableOpacity onPress={() => router.push("/")} style={{ marginTop: 20, backgroundColor: "#16a34a", padding: 16, borderRadius: 12 }}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f3f4f6", padding: 16, borderRadius: 16, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.name}</Text>
                  <Text style={{ fontSize: 16, color: "#16a34a", fontWeight: "bold" }}>Rs.{item.price * item.quantity}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity onPress={() => decreaseQuantity(item.id)} style={{ backgroundColor: "#e5e7eb", width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>-</Text>
                  </TouchableOpacity>
                  <Text style={{ marginHorizontal: 12, fontSize: 16, fontWeight: "bold" }}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => increaseQuantity(item.id)} style={{ backgroundColor: "#16a34a", width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>+</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => removeFromCart(item.id)} style={{ marginLeft: 12 }}>
                  <Text style={{ color: "red", fontSize: 18 }}>??</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <View style={{ borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 16, marginTop: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 16, color: "gray" }}>Subtotal</Text>
              <Text style={{ fontSize: 16 }}>Rs.{getTotal()}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
              <Text style={{ fontSize: 16, color: "gray" }}>Delivery</Text>
              <Text style={{ fontSize: 16, color: "#16a34a" }}>FREE</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>Total</Text>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#16a34a" }}>Rs.{getTotal()}</Text>
            </View>
            <TouchableOpacity onPress={handleCheckout} style={{ backgroundColor: "#16a34a", padding: 18, borderRadius: 16, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>Proceed to Pay Rs.{getTotal()}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
