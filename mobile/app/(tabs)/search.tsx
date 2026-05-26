import { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "../../lib/api";

interface Recipe {
  id: number; title: string; description: string;
  prepTime: number; cookTime: number; difficulty: string;
  category?: { name: string } | null;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#16A34A", medium: "#D97706", hard: "#DC2626",
};

export default function SearchScreen() {
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const router = useRouter();

  const search = async (q: string, p = 1, cat?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "20" });
      if (q) params.set("search", q);
      if (cat) params.set("category", cat);
      const res = await api.get(`/api/recipes?${params}`);
      if (p === 1) setResults(res.data.data || []);
      else setResults((prev) => [...prev, ...(res.data.data || [])]);
      setTotal(res.data.total || 0);
      setPage(p);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    search("", 1, categoryParam);
  }, [categoryParam]);

  const handleSearch = () => search(query, 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Recipes</Text>
        <View style={styles.searchBar}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput value={query} onChangeText={setQuery} onSubmitEditing={handleSearch}
            placeholder="Search by name…" placeholderTextColor="#9CA3AF"
            style={styles.input} returnKeyType="search" />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(""); search("", 1); }}>
              <Text style={{ color: "#9CA3AF", fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.resultCount}>{total.toLocaleString()} recipes found</Text>

      {loading && results.length === 0 ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#EA580C" /></View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(r) => String(r.id)}
          contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 10 }}
          onEndReached={() => { if (results.length < total) search(query, page + 1, categoryParam); }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loading ? <ActivityIndicator color="#EA580C" style={{ marginVertical: 12 }} /> : null}
          renderItem={({ item: r }) => (
            <TouchableOpacity onPress={() => router.push(`/recipe/${r.id}`)} style={styles.card}>
              <View style={styles.cardEmoji}><Text style={{ fontSize: 28 }}>🍽️</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle} numberOfLines={1}>{r.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{r.description}</Text>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 5, alignItems: "center" }}>
                  {r.category && <Text style={styles.catTag}>{r.category.name}</Text>}
                  <Text style={styles.timeTag}>⏱ {r.prepTime + r.cookTime}m</Text>
                  <Text style={[styles.diffTag, { color: DIFFICULTY_COLORS[r.difficulty] || "#6B7280" }]}>{r.difficulty}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<View style={styles.centered}><Text style={{ fontSize: 40 }}>🍽️</Text><Text style={styles.emptyText}>No recipes found</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  header: { backgroundColor: "#fff", paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 12 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFB", borderRadius: 12, paddingHorizontal: 12, gap: 8, borderWidth: 1, borderColor: "#E5E7EB" },
  input: { flex: 1, paddingVertical: 10, fontSize: 15, color: "#111827" },
  resultCount: { fontSize: 13, color: "#9CA3AF", paddingHorizontal: 16, paddingTop: 12 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 14, flexDirection: "row", gap: 12, borderWidth: 1, borderColor: "#F3F4F6" },
  cardEmoji: { width: 64, height: 64, backgroundColor: "#FFF7ED", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  cardDesc: { fontSize: 12, color: "#6B7280", marginTop: 3, lineHeight: 17 },
  catTag: { fontSize: 11, color: "#EA580C", backgroundColor: "#FFF7ED", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  timeTag: { fontSize: 11, color: "#6B7280" },
  diffTag: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  emptyText: { color: "#9CA3AF", marginTop: 12, fontSize: 16 },
});
