import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";

interface Recipe {
  id: number;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  views: number;
  category?: { name: string; slug: string } | null;
  author?: { name: string } | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  recipeCount: number;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  italian: "🍝", asian: "🍜", mexican: "🌮", desserts: "🍰",
  vegetarian: "🥗", american: "🍔", mediterranean: "🫒", indian: "🍛",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#16A34A", medium: "#D97706", hard: "#DC2626",
};

export default function HomeScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      const [recipesRes, categoriesRes] = await Promise.all([
        api.get("/api/recipes?limit=10"),
        api.get("/api/categories"),
      ]);
      setRecipes(recipesRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) return (
    <View style={styles.centered}><ActivityIndicator size="large" color="#EA580C" /></View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EA580C" />}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>RecipeVault</Text>
        <Text style={styles.subtitle}>Discover amazing recipes</Text>
      </View>

      {/* Categories */}
      {categories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, gap: 10 }}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} onPress={() => router.push({ pathname: "/search", params: { category: cat.id } })}
                style={styles.categoryChip}>
                <Text style={{ fontSize: 20 }}>{CATEGORY_EMOJIS[cat.slug] || "🍽️"}</Text>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryCount}>{Number(cat.recipeCount).toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Popular Recipes */}
      <View style={[styles.section, { paddingHorizontal: 16 }]}>
        <Text style={styles.sectionTitle}>Most Popular</Text>
        {recipes.map((r) => (
          <TouchableOpacity key={r.id} onPress={() => router.push(`/recipe/${r.id}`)} style={styles.recipeCard}>
            <View style={styles.recipeEmoji}><Text style={{ fontSize: 32 }}>🍽️</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.recipeTitle} numberOfLines={1}>{r.title}</Text>
              <Text style={styles.recipeDesc} numberOfLines={2}>{r.description}</Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 6, alignItems: "center" }}>
                {r.category && <Text style={styles.categoryTag}>{r.category.name}</Text>}
                <Text style={styles.timeTag}>⏱ {r.prepTime + r.cookTime}m</Text>
                <Text style={[styles.diffTag, { color: DIFFICULTY_COLORS[r.difficulty] || "#6B7280" }]}>
                  {r.difficulty}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { backgroundColor: "#EA580C", padding: 24, paddingTop: 60 },
  logo: { fontSize: 28, fontWeight: "800", color: "#fff" },
  subtitle: { fontSize: 14, color: "#FED7AA", marginTop: 4 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 12, paddingHorizontal: 16 },
  categoryChip: { backgroundColor: "#fff", borderRadius: 16, padding: 12, alignItems: "center", minWidth: 90, borderWidth: 1, borderColor: "#F3F4F6", marginRight: 8 },
  categoryName: { fontSize: 12, fontWeight: "600", color: "#374151", marginTop: 4 },
  categoryCount: { fontSize: 10, color: "#9CA3AF", marginTop: 2 },
  recipeCard: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: "row", gap: 12, borderWidth: 1, borderColor: "#F3F4F6", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  recipeEmoji: { width: 72, height: 72, backgroundColor: "#FFF7ED", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  recipeTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  recipeDesc: { fontSize: 13, color: "#6B7280", marginTop: 3, lineHeight: 18 },
  categoryTag: { fontSize: 11, color: "#EA580C", backgroundColor: "#FFF7ED", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  timeTag: { fontSize: 11, color: "#6B7280" },
  diffTag: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
});
