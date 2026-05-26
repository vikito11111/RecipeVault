import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { login } from "../lib/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert("Error", "Please fill in all fields"); return; }
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/profile");
    } catch (err: any) {
      Alert.alert("Login Failed", err.response?.data?.error || "Invalid credentials");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoArea}>
          <Text style={styles.logo}>🍽️</Text>
          <Text style={styles.appName}>RecipeVault</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
              placeholder="you@example.com" placeholderTextColor="#9CA3AF" style={styles.input} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput value={password} onChangeText={setPassword} secureTextEntry
              placeholder="••••••••" placeholderTextColor="#9CA3AF" style={styles.input} />
          </View>

          <TouchableOpacity onPress={handleLogin} disabled={loading} style={[styles.btn, loading && styles.btnDisabled]}>
            <Text style={styles.btnText}>{loading ? "Signing in…" : "Sign In"}</Text>
          </TouchableOpacity>

          <View style={styles.hint}>
            <Text style={styles.hintText}>Demo: admin@recipevault.com / demo123</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.link}>Sign Up</Text>
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
  logoArea: { alignItems: "center", paddingVertical: 40 },
  logo: { fontSize: 56 },
  appName: { fontSize: 28, fontWeight: "800", color: "#EA580C", marginTop: 8 },
  subtitle: { fontSize: 15, color: "#6B7280", marginTop: 4 },
  form: { gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151" },
  input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#111827", backgroundColor: "#fff" },
  btn: { backgroundColor: "#EA580C", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  hint: { backgroundColor: "#FFFBEB", borderRadius: 10, padding: 10 },
  hintText: { fontSize: 12, color: "#92400E", textAlign: "center" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  footerText: { fontSize: 14, color: "#6B7280" },
  link: { fontSize: 14, color: "#EA580C", fontWeight: "600" },
});
