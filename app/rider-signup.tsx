import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, StatusBar, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { router } from "expo-router";
import { theme } from "../lib/theme";

export default function RiderSignup() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [pan, setPan] = useState("");
  const [licence, setLicence] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("bike");
  const [bankAccount, setBankAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!bankAccount || !ifsc) return Alert.alert("Error", "Fill all fields");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name, phone_number: phone, role: "rider" } }
    });
    if (error) { Alert.alert("Error", error.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from("riders").insert({
        user_id: data.user.id,
        name, phone,
        aadhar_number: aadhar,
        pan_number: pan,
        licence_number: licence,
        vehicle_number: vehicleNumber,
        vehicle_type: vehicleType,
        bank_account: bankAccount,
        ifsc_code: ifsc,
        is_verified: false,
      });
    }
    setLoading(false);
    Alert.alert("Application Submitted!", "Your rider application is under review. Admin will verify within 24 hours.", [
      { text: "OK", onPress: () => router.replace("/login") }
    ]);
  };

  const InputField = ({ label, value, onChangeText, placeholder, keyboardType = "default", maxLength = undefined, autoCapitalize = "sentences", secureTextEntry = false }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, color: theme.subtext, marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        autoCorrect={false}
        blurOnSubmit={false}
        style={{ backgroundColor: theme.white, padding: 16, borderRadius: 16, fontSize: 16, borderWidth: 1, borderColor: "#E9D5FF" }}
      />
    </View>
  );

  const progressBar = () => (
    <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
      {[1,2,3,4].map(s => (
        <View key={s} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: s <= step ? "#fff" : "rgba(255,255,255,0.3)" }} />
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} keyboardShouldPersistTaps="handled">
        <StatusBar barStyle="dark-content" />
        <View style={{ backgroundColor: theme.primary, paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()} style={{ marginBottom: 12 }}>
            <Text style={{ color: "#E9D5FF", fontSize: 15 }}>{"<"} Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 26, fontWeight: "bold", color: "#fff" }}>Rider Registration</Text>
          <Text style={{ fontSize: 14, color: "#E9D5FF", marginTop: 4 }}>Step {step} of 4</Text>
          {progressBar()}
        </View>

        <View style={{ padding: 20 }}>
          {step === 1 && (
            <View>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: theme.primary, marginBottom: 20 }}>Basic Details</Text>
              <InputField label="Full Name" value={name} onChangeText={setName} placeholder="As per Aadhar" />
              <InputField label="Email" value={email} onChangeText={setEmail} placeholder="Enter email" keyboardType="email-address" autoCapitalize="none" />
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, color: theme.subtext, marginBottom: 6 }}>Phone Number</Text>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ backgroundColor: theme.white, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E9D5FF", marginRight: 8, justifyContent: "center" }}>
                    <Text style={{ fontSize: 16, fontWeight: "600" }}>+91</Text>
                  </View>
                  <TextInput value={phone} onChangeText={setPhone} placeholder="9999999999" keyboardType="phone-pad" maxLength={10}
                    autoCorrect={false} blurOnSubmit={false}
                    style={{ flex: 1, backgroundColor: theme.white, padding: 16, borderRadius: 16, fontSize: 16, borderWidth: 1, borderColor: "#E9D5FF" }} />
                </View>
              </View>
              <InputField label="Password" value={password} onChangeText={setPassword} placeholder="Min 6 characters" secureTextEntry={true} />
              <TouchableOpacity onPress={() => {
                if (!name || !email || !phone || !password) return Alert.alert("Error", "Fill all fields");
                if (password.length < 6) return Alert.alert("Error", "Password min 6 characters");
                if (phone.length < 10) return Alert.alert("Error", "Enter valid phone");
                setStep(2);
              }} style={{ backgroundColor: theme.primary, padding: 18, borderRadius: 16, alignItems: "center", marginTop: 8 }}>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: theme.primary, marginBottom: 20 }}>Documents</Text>
              <InputField label="Aadhar Number" value={aadhar} onChangeText={setAadhar} placeholder="12 digit number" keyboardType="number-pad" maxLength={12} autoCapitalize="none" />
              <InputField label="PAN Number (optional)" value={pan} onChangeText={setPan} placeholder="ABCDE1234F" autoCapitalize="characters" maxLength={10} />
              <InputField label="Driving Licence Number" value={licence} onChangeText={setLicence} placeholder="AP1234567890" autoCapitalize="characters" />
              <TouchableOpacity onPress={() => {
                if (!aadhar || !licence) return Alert.alert("Error", "Aadhar and Licence required");
                if (aadhar.length !== 12) return Alert.alert("Error", "Aadhar must be 12 digits");
                setStep(3);
              }} style={{ backgroundColor: theme.primary, padding: 18, borderRadius: 16, alignItems: "center", marginTop: 8 }}>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: theme.primary, marginBottom: 20 }}>Vehicle Details</Text>
              <Text style={{ fontSize: 13, color: theme.subtext, marginBottom: 8 }}>Vehicle Type</Text>
              <View style={{ flexDirection: "row", marginBottom: 20, gap: 10 }}>
                {["bike", "scooter", "bicycle"].map(v => (
                  <TouchableOpacity key={v} onPress={() => setVehicleType(v)}
                    style={{ flex: 1, padding: 14, borderRadius: 14, alignItems: "center", backgroundColor: vehicleType === v ? theme.primary : theme.card }}>
                    <Text style={{ color: vehicleType === v ? "#fff" : theme.subtext, fontWeight: "600", textTransform: "capitalize" }}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <InputField label="Vehicle Number" value={vehicleNumber} onChangeText={setVehicleNumber} placeholder="AP 16 XX 0000" autoCapitalize="characters" />
              <TouchableOpacity onPress={() => {
                if (!vehicleNumber) return Alert.alert("Error", "Enter vehicle number");
                setStep(4);
              }} style={{ backgroundColor: theme.primary, padding: 18, borderRadius: 16, alignItems: "center", marginTop: 8 }}>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 4 && (
            <View>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: theme.primary, marginBottom: 20 }}>Bank Details</Text>
              <InputField label="Bank Account Number" value={bankAccount} onChangeText={setBankAccount} placeholder="Account number" keyboardType="number-pad" autoCapitalize="none" />
              <InputField label="IFSC Code" value={ifsc} onChangeText={setIfsc} placeholder="SBIN0001234" autoCapitalize="characters" maxLength={11} />
              <View style={{ backgroundColor: "#D1FAE5", padding: 16, borderRadius: 14, marginBottom: 20, marginTop: 8 }}>
                <Text style={{ color: "#065F46", fontSize: 13, fontWeight: "600" }}>By submitting, you agree to Sermcy rider terms. Documents will be verified within 24 hours.</Text>
              </View>
              <TouchableOpacity onPress={handleSubmit} disabled={loading}
                style={{ backgroundColor: theme.primary, padding: 18, borderRadius: 16, alignItems: "center" }}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>Submit Application</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
