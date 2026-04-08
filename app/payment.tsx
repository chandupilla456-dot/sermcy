import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView, TextInput } from "react-native";
import { useState } from "react";
import { useCartStore } from "../lib/cartStore";
import { supabase } from "../lib/supabase";
import { router } from "expo-router";
import { theme } from "../lib/theme";
import RazorpayCheckout from "react-native-razorpay";

const RAZORPAY_KEY_ID = "rzp_test_Sb5k2TFTbA7xlF";

export default function Payment() {
  const { cart, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const finalTotal = Math.max(0, getTotal() - discount);

  const applyCoupon = async () => {
    if (!couponCode) return Alert.alert("Error", "Enter coupon code");
    setCouponLoading(true);
    const { data } = await supabase.from("coupons").select("*").eq("code", couponCode.toUpperCase()).eq("active", true).single();
    setCouponLoading(false);
    if (!data) { Alert.alert("Invalid Coupon", "Coupon not found or expired"); return; }
    const discountAmount = Math.round(getTotal() * data.discount_percent / 100);
    setDiscount(discountAmount);
    setCouponApplied(true);
    Alert.alert("Coupon Applied!", data.description + " - Rs." + discountAmount + " off!");
  };

  const saveOrder = async (paymentId = null) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: orderData, error } = await supabase.from("orders")
      .insert([{
        user_id: user?.id,
        total: finalTotal,
        status: "pending",
        coupon_code: couponApplied ? couponCode : null,
        discount_amount: discount,
        payment_method: paymentMethod,
        payment_id: paymentId,
      }])
      .select().single();
    if (error) throw error;
    const items = cart.map(item => ({ order_id: orderData.id, product_id: item.id, quantity: item.quantity }));
    await supabase.from("order_items").insert(items);
    return orderData;
  };

  const handleCOD = async () => {
    setLoading(true);
    try {
      const orderData = await saveOrder();
      clearCart();
      setLoading(false);
      Alert.alert("Order Placed!", "Your order will be delivered in 20-30 minutes.", [
        { text: "Track Order", onPress: () => router.push({ pathname: "/ordertrack", params: { orderId: orderData.id } }) },
        { text: "Home", onPress: () => router.replace("/") }
      ]);
    } catch (err) {
      setLoading(false);
      Alert.alert("Error", "Something went wrong");
    }
  };

  const handleRazorpay = async () => {
    setLoading(true);
    try {
      const options = {
        description: "Sermcy Order",
        image: "https://sermcy.netlify.app/logo.png",
        currency: "INR",
        key: RAZORPAY_KEY_ID,
        amount: finalTotal * 100,
        name: "Sermcy",
        prefill: { contact: "9999999999", email: "customer@sermcy.com" },
        theme: { color: theme.primary }
      };
      const data = await RazorpayCheckout.open(options);
      const orderData = await saveOrder(data.razorpay_payment_id);
      clearCart();
      setLoading(false);
      Alert.alert("Payment Successful!", "Order placed! Delivering in 20-30 mins.", [
        { text: "Track Order", onPress: () => router.push({ pathname: "/ordertrack", params: { orderId: orderData.id } }) },
        { text: "Home", onPress: () => router.replace("/") }
      ]);
    } catch (error) {
      setLoading(false);
      if (error.code !== "PAYMENT_CANCELLED") Alert.alert("Payment Failed", "Please try again");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ backgroundColor: theme.primary, paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
          <Text style={{ color: "#E9D5FF", fontSize: 15 }}>{"<"} Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: "bold", color: "#fff" }}>Checkout</Text>
      </View>

      <View style={{ padding: 20 }}>
        <View style={{ backgroundColor: theme.white, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#E9D5FF" }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text, marginBottom: 16 }}>Order Summary</Text>
          {cart.map(item => (
            <View key={item.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
              <Text style={{ fontSize: 14, color: theme.text, flex: 1 }}>{item.name} x{item.quantity}</Text>
              <Text style={{ fontSize: 14, fontWeight: "600" }}>Rs.{item.price * item.quantity}</Text>
            </View>
          ))}
          <View style={{ borderTopWidth: 1, borderTopColor: "#E9D5FF", marginTop: 12, paddingTop: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ color: theme.subtext }}>Subtotal</Text>
              <Text>Rs.{getTotal()}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ color: theme.subtext }}>Delivery</Text>
              <Text style={{ color: "#10B981", fontWeight: "600" }}>FREE</Text>
            </View>
            {discount > 0 && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                <Text style={{ color: "#10B981" }}>Coupon Discount</Text>
                <Text style={{ color: "#10B981", fontWeight: "600" }}>-Rs.{discount}</Text>
              </View>
            )}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>Total</Text>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.primary }}>Rs.{finalTotal}</Text>
            </View>
          </View>
        </View>

        <View style={{ backgroundColor: theme.white, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#E9D5FF" }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text, marginBottom: 12 }}>Coupon Code</Text>
          {couponApplied ? (
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#D1FAE5", padding: 14, borderRadius: 14 }}>
              <View>
                <Text style={{ color: "#065F46", fontWeight: "700" }}>{couponCode} Applied!</Text>
                <Text style={{ color: "#065F46", fontSize: 13 }}>Rs.{discount} discount</Text>
              </View>
              <TouchableOpacity onPress={() => { setCouponCode(""); setDiscount(0); setCouponApplied(false); }}>
                <Text style={{ color: "#DC2626", fontWeight: "bold" }}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: "row" }}>
              <TextInput value={couponCode} onChangeText={setCouponCode} placeholder="Enter coupon code"
                autoCapitalize="characters" autoCorrect={false}
                style={{ flex: 1, backgroundColor: theme.background, padding: 14, borderRadius: 14, fontSize: 15, borderWidth: 1, borderColor: "#E9D5FF", marginRight: 8 }} />
              <TouchableOpacity onPress={applyCoupon} disabled={couponLoading}
                style={{ backgroundColor: theme.primary, paddingHorizontal: 16, borderRadius: 14, justifyContent: "center" }}>
                {couponLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: "#fff", fontWeight: "bold" }}>Apply</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ backgroundColor: theme.white, borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: "#E9D5FF" }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text, marginBottom: 16 }}>Payment Method</Text>
          {[
            { id: "cod", label: "Cash on Delivery", sub: "Pay when order arrives" },
            { id: "online", label: "Pay Online (UPI/Card)", sub: "Razorpay - Secure & Fast" },
          ].map(m => (
            <TouchableOpacity key={m.id} onPress={() => setPaymentMethod(m.id)}
              style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: m.id === "cod" ? 1 : 0, borderBottomColor: "#E9D5FF" }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: paymentMethod === m.id ? theme.primary : "#E9D5FF", backgroundColor: paymentMethod === m.id ? theme.primary : "#fff", marginRight: 14, justifyContent: "center", alignItems: "center" }}>
                {paymentMethod === m.id && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#fff" }} />}
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: "600", color: theme.text }}>{m.label}</Text>
                <Text style={{ fontSize: 12, color: theme.subtext, marginTop: 2 }}>{m.sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={paymentMethod === "cod" ? handleCOD : handleRazorpay}
          disabled={loading}
          style={{ backgroundColor: theme.primary, padding: 18, borderRadius: 16, alignItems: "center" }}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
              {paymentMethod === "cod" ? "Place Order" : "Pay"} Rs.{finalTotal}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
