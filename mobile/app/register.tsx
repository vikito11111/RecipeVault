import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { register } from "../lib/auth";

export default function RegisterScreen() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    const { name, email, password, confirm } = form;
    if (!name || !email || !password) { Alert.alert("Error", "Please fill in all fields"); return; }
    if (password !== confirm) { Alert.alert("Error", "Passwords don't match"); return; }
    if (password.length < 6) { Alert.alert("Error", "Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      router.replace("/profile");
    } catch (err: any) {
      Alert.alert("Registration Failed", err.response?.data?.error || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoArea}>
          <Text style={styles.logo}>🍽️</Text>
          <Text style={styles.appName}>RecipeVault</Text>
          <Text style={styles.subtitle}>Create your account</Text>
        </View>

        <View style={styles.form}>
          {[
            { key: "name", label: "Full Name", placeholder: "John Doe", keyboard: "default" as const, secure: false },
            { key: "email", label: "Email", placeholder: "you@example.com", keyboard: "email-address" as const, secure: false },
            { key: "password", label: "Password", placeholder: "Min. 6 characters", keyboard: "default" as const, secure: true },
            { key: "confirm", label: "Confirm Password", placeholder: "Repeat password", keyboard: "default" as const, secure: true },
          ].map((f) => (
            <View key={f.key} style={styles.field}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput value={form[f.key as keyof typeof form]} onChangeText={(v) => setForm({ ...form, [f.key]: v })}
                keyboardType={f.keyboard} autoCapitalize={f.key === "name" ? "words" : "none"}
                secureTextEntry={f.secure} placeholder={f.placeholder} placeholderTextColor="#9CA3AF" style={styles.input} />
            </View>
          ))}

          <TouchableOpacity onPress={handleRegister} disabled={loading} style={[styles.btn, loading && styles.btnDisabled]}>
            <Text style={styles.btnText}>{loading ? "Creating…" : "Create Account"}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scroll: { flexGrow: 1, padding: 24 },
  logoArea: { alignItems: "center", paddingVertical: 32 },
  logo: { fontSize: 48 },
  appName: { fontSize: 26, fontWeight: "800", color: "#EA580C", marginTop: 8 },
  subtitle: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  form: { gap: 14 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151" },
  input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#111827", backgroundColor: "#fff" },
  btn: { backgroundColor: "#EA580C", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  footerText: { fontSize: 14, color: "#6B7280" },
  link: { fontSize: 14, color: "#EA580C", fontWeight: "600" },
});
