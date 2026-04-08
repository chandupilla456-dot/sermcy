import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StatusBar, ScrollView } from "react-native";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { router } from "expo-router";
import { theme } from "../lib/theme";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !phone || !password) return Alert.alert("Error", "Fill all fields");
    if (password.length < 6) return Alert.alert("Error", "Password min 6 characters");
    if (phone.length < 10) return Alert.alert("Error", "Enter valid phone number");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name, phone_number: phone } }
    });
    setLoading(false);
    if (error) Alert.alert("Signup Failed", error.message);
    else { setStep("verify"); Alert.alert("Check Email!", "We sent a 6-digit OTP to " + email); }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return Alert.alert("Error", "Enter OTP");
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "signup" });
    setLoading(false);
    if (error) Alert.alert("Invalid OTP", error.message);
    else { Alert.alert("Success!", "Account verified! Welcome to Sermcy!", [{ text: "OK", onPress: () => router.replace("/") }]); }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setLoading(false);
    if (error) Alert.alert("Error", error.message);
    else Alert.alert("Sent!", "New OTP sent to " + email);
  };

  if (step === "verify") return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.primary, justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 16 }}>
          <Text style={{ fontSize: 36, color: "#fff", fontWeight: "bold" }}>S</Text>
        </View>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: theme.primary, textAlign: "center", marginBottom: 8 }}>Verify Email</Text>
        <Text style={{ fontSize: 15, color: theme.subtext, textAlign: "center", marginBottom: 8 }}>We sent a 6-digit OTP to</Text>
        <Text style={{ fontSize: 16, color: theme.primary, fontWeight: "bold", textAlign: "center", marginBottom: 40 }}>{email}</Text>

        <TextInput
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          style={{ backgroundColor: theme.white, padding: 16, borderRadius: 16, fontSize: 28, marginBottom: 24, borderWidth: 1, borderColor: "#E9D5FF", textAlign: "center", letterSpacing: 10 }}
        />

        <TouchableOpacity onPress={handleVerifyOtp} disabled={loading}
          style={{ backgroundColor: theme.primary, padding: 18, borderRadius: 16, alignItems: "center", marginBottom: 16 }}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>Verify & Continue</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResendOtp} style={{ alignItems: "center", marginBottom: 16 }}>
          <Text style={{ color: theme.primary, fontWeight: "600", fontSize: 15 }}>Resend OTP</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setStep("form")} style={{ alignItems: "center" }}>
          <Text style={{ color: theme.subtext, fontSize: 15 }}>Change email? Go back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.primary, justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 16 }}>
          <Text style={{ fontSize: 36, color: "#fff", fontWeight: "bold" }}>S</Text>
        </View>
        <Text style={{ fontSize: 32, fontWeight: "bold", color: theme.primary, textAlign: "center", marginBottom: 4 }}>Join Sermcy</Text>
        <Text style={{ fontSize: 16, color: theme.subtext, textAlign: "center", marginBottom: 40 }}>Create your account</Text>

        <Text style={{ fontSize: 14, color: theme.subtext, marginBottom: 6, marginLeft: 4 }}>Full Name</Text>
        <TextInput placeholder="Enter your name" value={name} onChangeText={setName}
          style={{ backgroundColor: theme.white, padding: 16, borderRadius: 16, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E9D5FF" }} />

        <Text style={{ fontSize: 14, color: theme.subtext, marginBottom: 6, marginLeft: 4 }}>Email</Text>
        <TextInput placeholder="Enter your email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
          style={{ backgroundColor: theme.white, padding: 16, borderRadius: 16, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E9D5FF" }} />

        <Text style={{ fontSize: 14, color: theme.subtext, marginBottom: 6, marginLeft: 4 }}>Phone Number</Text>
        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          <View style={{ backgroundColor: theme.white, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E9D5FF", marginRight: 8, justifyContent: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: theme.text }}>+91</Text>
          </View>
          <TextInput placeholder="9999999999" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10}
            style={{ flex: 1, backgroundColor: theme.white, padding: 16, borderRadius: 16, fontSize: 16, borderWidth: 1, borderColor: "#E9D5FF" }} />
        </View>

        <Text style={{ fontSize: 14, color: theme.subtext, marginBottom: 6, marginLeft: 4 }}>Password</Text>
        <TextInput placeholder="Min 6 characters" value={password} onChangeText={setPassword} secureTextEntry
          style={{ backgroundColor: theme.white, padding: 16, borderRadius: 16, fontSize: 16, marginBottom: 32, borderWidth: 1, borderColor: "#E9D5FF" }} />

        <TouchableOpacity onPress={handleSignup} disabled={loading}
          style={{ backgroundColor: theme.primary, padding: 18, borderRadius: 16, alignItems: "center" }}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")} style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={{ color: theme.subtext, fontSize: 16 }}>Already have account? <Text style={{ color: theme.primary, fontWeight: "bold" }}>Login</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
