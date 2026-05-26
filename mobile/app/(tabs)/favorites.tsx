import { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { api } from "../../lib/api";
import { getMe } from "../../lib/auth";

interface FavoriteItem {
  id: number;
  recipe: { id: number; title: string; description: string; prepTime: number; cookTime: number; difficulty: string } | null;
  category?: { name: string } | null;
}

export default function FavoritesScreen() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggedIn, setLoggedIn] = useState(true);
  const router = useRouter();

  const load = useCallback(async () => {
    const user = await getMe();
    if (!user) { setLoggedIn(false); setLoading(false); setRefreshing(false); return; }
    setLoggedIn(true);
    try {
      const res = await api.get("/api/favorites");
      setItems(res.data.data || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  const onRefresh = () => { setRefreshing(true); load(); };

  if (!loggedIn) return (
    <View style={styles.centered}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>♡</Text>
      <Text style={styles.emptyTitle}>Sign in to view favorites</Text>
      <TouchableOpacity onPress={() => router.push("/login")} style={styles.btn}>
        <Text style={styles.btnText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) return <View style={styles.centered}><ActivityIndicator size="large" color="#EA580C" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Recipes</Text>
        <Text style={styles.headerSub}>{items.length} recipes</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EA580C" />}
        renderItem={({ item: f }) => f.recipe && (
          <TouchableOpacity onPress={() => router.push(`/recipe/${f.recipe!.id}`)} style={styles.card}>
            <View style={styles.cardEmoji}><Text style={{ fontSize: 28 }}>🍽️</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle} numberOfLines={1}>{f.recipe.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{f.recipe.description}</Text>
              <Text style={styles.timeTag}>⏱ {f.recipe.prepTime + f.recipe.cookTime}m</Text>
            </View>
            <Text style={{ fontSize: 20, color: "#EF4444" }}>♥</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={[styles.centered, { flex: 1 }]}>
            <Text style={{ fontSize: 48 }}>♡</Text>
            <Text style={styles.emptyTitle}>No saved recipes</Text>
            <TouchableOpacity onPress={() => router.push("/")} style={styles.btn}>
              <Text style={styles.btnText}>Browse Recipes</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F9FAFB" },
  header: { backgroundColor: "#fff", paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
  headerSub: { fontSize: 13, color: "#9CA3AF", marginTop: 2 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 14, flexDirection: "row", gap: 12, borderWidth: 1, borderColor: "#F3F4F6", alignItems: "center" },
  cardEmoji: { width: 60, height: 60, backgroundColor: "#FFF7ED", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  cardDesc: { fontSize: 12, color: "#6B7280", marginTop: 3, lineHeight: 17 },
  timeTag: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#374151", marginTop: 8, marginBottom: 20 },
  btn: { backgroundColor: "#EA580C", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
