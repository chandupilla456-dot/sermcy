import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StatusBar, ScrollView } from "react-native";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { router } from "expo-router";
import { theme } from "../lib/theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [useOtp, setUseOtp] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Fill all fields");
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert("Login Failed", error.message);
    else {
      const role = data.user?.user_metadata?.role;
      if (role === "rider") router.replace("/rider");
      else router.replace("/");
    }
  };

  const handleSendOtp = async () => {
    if (!email) return Alert.alert("Error", "Enter email");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) Alert.alert("Error", error.message);
    else { setStep("otp"); Alert.alert("OTP Sent!", "Check your email for the 6-digit code"); }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return Alert.alert("Error", "Enter OTP");
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    setLoading(false);
    if (error) Alert.alert("Invalid OTP", error.message);
    else {
      const role = data.user?.user_metadata?.role;
      if (role === "rider") router.replace("/rider");
      else router.replace("/");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <View style={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.primary, justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 16 }}>
          <Text style={{ fontSize: 36, color: "#fff", fontWeight: "bold" }}>S</Text>
        </View>
        <Text style={{ fontSize: 36, fontWeight: "bold", color: theme.primary, textAlign: "center", marginBottom: 4 }}>Sermcy</Text>
        <Text style={{ fontSize: 16, color: theme.subtext, textAlign: "center", marginBottom: 48 }}>Fresh juices, shakes and ice creams</Text>

        {!useOtp ? (
          <>
            <Text style={{ fontSize: 14, color: theme.subtext, marginBottom: 6, marginLeft: 4 }}>Email</Text>
            <TextInput placeholder="Enter your email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
              style={{ backgroundColor: theme.white, padding: 16, borderRadius: 16, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E9D5FF" }} />
            <Text style={{ fontSize: 14, color: theme.subtext, marginBottom: 6, marginLeft: 4 }}>Password</Text>
            <TextInput placeholder="Enter your password" value={password} onChangeText={setPassword} secureTextEntry
              style={{ backgroundColor: theme.white, padding: 16, borderRadius: 16, fontSize: 16, marginBottom: 24, borderWidth: 1, borderColor: "#E9D5FF" }} />
            <TouchableOpacity onPress={handleLogin} disabled={loading}
              style={{ backgroundColor: theme.primary, padding: 18, borderRadius: 16, alignItems: "center", marginBottom: 16 }}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>Login</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setUseOtp(true)} style={{ alignItems: "center", marginBottom: 16 }}>
              <Text style={{ color: theme.primary, fontWeight: "600", fontSize: 15 }}>Login with Email OTP instead</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {step === "email" ? (
              <>
                <Text style={{ fontSize: 16, fontWeight: "600", color: theme.text, marginBottom: 20, textAlign: "center" }}>We will send an OTP to your email</Text>
                <Text style={{ fontSize: 14, color: theme.subtext, marginBottom: 6, marginLeft: 4 }}>Email Address</Text>
                <TextInput placeholder="Enter your email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
                  style={{ backgroundColor: theme.white, padding: 16, borderRadius: 16, fontSize: 16, marginBottom: 24, borderWidth: 1, borderColor: "#E9D5FF" }} />
                <TouchableOpacity onPress={handleSendOtp} disabled={loading}
                  style={{ backgroundColor: theme.primary, padding: 18, borderRadius: 16, alignItems: "center", marginBottom: 16 }}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>Send OTP</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 16, fontWeight: "600", color: theme.text, marginBottom: 8, textAlign: "center" }}>Enter OTP sent to</Text>
                <Text style={{ fontSize: 15, color: theme.primary, fontWeight: "bold", textAlign: "center", marginBottom: 24 }}>{email}</Text>
                <TextInput placeholder="Enter 6-digit OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6}
                  style={{ backgroundColor: theme.white, padding: 16, borderRadius: 16, fontSize: 24, marginBottom: 24, borderWidth: 1, borderColor: "#E9D5FF", textAlign: "center", letterSpacing: 8 }} />
                <TouchableOpacity onPress={handleVerifyOtp} disabled={loading}
                  style={{ backgroundColor: theme.primary, padding: 18, borderRadius: 16, alignItems: "center", marginBottom: 16 }}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>Verify OTP</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStep("email")} style={{ alignItems: "center" }}>
                  <Text style={{ color: theme.subtext, fontSize: 15 }}>Change email?</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity onPress={() => { setUseOtp(false); setStep("email"); }} style={{ alignItems: "center", marginTop: 16 }}>
              <Text style={{ color: theme.primary, fontWeight: "600", fontSize: 15 }}>Login with Password instead</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => router.push("/signup")} style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={{ color: theme.subtext, fontSize: 16 }}>No account? <Text style={{ color: theme.primary, fontWeight: "bold" }}>Sign Up</Text></Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/rider-signup")} style={{ marginTop: 12, alignItems: "center" }}>
          <Text style={{ color: theme.subtext, fontSize: 14 }}>Want to deliver? <Text style={{ color: theme.primary, fontWeight: "bold" }}>Join as Rider</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
