import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { getMe, logout, type User } from "../../lib/auth";
import { api } from "../../lib/api";

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ recipes: 0, reviews: 0 });
  const router = useRouter();

  const load = useCallback(async () => {
    const me = await getMe();
    setUser(me);
    if (me) {
      try {
        const [recipeRes, userRes] = await Promise.all([
          api.get(`/api/users/${me.id}`),
          api.get("/api/auth/me"),
        ]);
        setStats({ recipes: recipeRes.data.recipes?.length || 0, reviews: 0 });
      } catch {}
    }
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: async () => { await logout(); setUser(null); router.replace("/"); } },
    ]);
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#EA580C" /></View>;

  if (!user) return (
    <View style={styles.centered}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>👤</Text>
      <Text style={styles.title}>Sign in to RecipeVault</Text>
      <Text style={styles.subtitle}>Access your recipes, favorites, and more</Text>
      <TouchableOpacity onPress={() => router.push("/login")} style={styles.primaryBtn}>
        <Text style={styles.primaryBtnText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/register")} style={styles.secondaryBtn}>
        <Text style={styles.secondaryBtnText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {user.role === "admin" && <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>Admin</Text></View>}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.recipes}</Text>
          <Text style={styles.statLabel}>Recipes</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>-</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
      </View>

      {user.bio && <Text style={styles.bio}>{user.bio}</Text>}

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => router.push("/favorites")} style={styles.actionBtn}>
          <Text style={{ fontSize: 20 }}>♥</Text>
          <Text style={styles.actionText}>Saved Recipes</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/search")} style={styles.actionBtn}>
          <Text style={{ fontSize: 20 }}>🔍</Text>
          <Text style={styles.actionText}>Browse Recipes</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={[styles.actionBtn, { borderTopWidth: 1, borderTopColor: "#F3F4F6" }]}>
          <Text style={{ fontSize: 20 }}>🚪</Text>
          <Text style={[styles.actionText, { color: "#EF4444" }]}>Sign Out</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F9FAFB", padding: 24 },
  header: { backgroundColor: "#EA580C", paddingTop: 60, paddingBottom: 30, alignItems: "center" },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: "700", color: "#EA580C" },
  name: { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 4 },
  email: { fontSize: 14, color: "#FED7AA" },
  adminBadge: { backgroundColor: "#fff", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginTop: 8 },
  adminBadgeText: { fontSize: 11, fontWeight: "700", color: "#EA580C" },
  statsRow: { backgroundColor: "#fff", flexDirection: "row", padding: 20, marginTop: 12, marginHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: "#F3F4F6" },
  statBox: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "700", color: "#111827" },
  statLabel: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  divider: { width: 1, backgroundColor: "#F3F4F6", marginVertical: 4 },
  bio: { fontSize: 14, color: "#6B7280", lineHeight: 20, marginHorizontal: 16, marginTop: 12 },
  actions: { backgroundColor: "#fff", marginHorizontal: 16, marginTop: 16, borderRadius: 16, borderWidth: 1, borderColor: "#F3F4F6", overflow: "hidden" },
  actionBtn: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  actionText: { flex: 1, fontSize: 15, fontWeight: "500", color: "#374151" },
  chevron: { fontSize: 18, color: "#9CA3AF" },
  title: { fontSize: 22, fontWeight: "700", color: "#111827", textAlign: "center" },
  subtitle: { fontSize: 14, color: "#6B7280", textAlign: "center", marginTop: 6, marginBottom: 24 },
  primaryBtn: { backgroundColor: "#EA580C", paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, width: "100%", alignItems: "center", marginBottom: 12 },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryBtn: { backgroundColor: "#fff", paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, width: "100%", alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" },
  secondaryBtnText: { color: "#374151", fontWeight: "600", fontSize: 16 },
});
