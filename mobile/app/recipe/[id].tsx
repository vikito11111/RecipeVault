import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "../../lib/api";
import { getMe } from "../../lib/auth";

interface Recipe {
  id: number; title: string; description: string; ingredients: string; instructions: string;
  prepTime: number; cookTime: number; servings: number; difficulty: string; views: number;
  imageUrl?: string; category?: { name: string; slug: string } | null;
  author?: { name: string; bio?: string } | null;
}
interface Review {
  id: number; rating: number; comment?: string | null;
  author?: { name: string } | null;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#16A34A", medium: "#D97706", hard: "#DC2626",
};

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const [recipeRes, user] = await Promise.all([api.get(`/api/recipes/${id}`), getMe()]);
        setRecipe(recipeRes.data.recipe);
        setReviews(recipeRes.data.reviews || []);
        setAvgRating(recipeRes.data.avgRating || 0);
        setLoggedIn(!!user);
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);

  const toggleFavorite = async () => {
    if (!loggedIn) { router.push("/login"); return; }
    try {
      const res = await api.post("/api/favorites", { recipeId: parseInt(id!) });
      setFavorited(res.data.favorited);
    } catch {}
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#EA580C" /></View>;
  if (!recipe) return <View style={styles.centered}><Text style={styles.errorText}>Recipe not found</Text></View>;

  const ingredientsList = recipe.ingredients.split("\n").filter(Boolean);
  const instructionsList = recipe.instructions.split("\n").filter(Boolean);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageBox}>
        <Text style={{ fontSize: 64 }}>🍽️</Text>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favBtn}>
          <Text style={{ fontSize: 22, color: favorited ? "#EF4444" : "#9CA3AF" }}>{favorited ? "♥" : "♡"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {recipe.category && <Text style={styles.category}>{recipe.category.name}</Text>}
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.description}>{recipe.description}</Text>

        {avgRating > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 }}>
            <Text style={{ color: "#FBBF24", fontSize: 14 }}>{"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}</Text>
            <Text style={{ fontSize: 13, color: "#6B7280" }}>{avgRating.toFixed(1)} ({reviews.length})</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{recipe.prepTime}m</Text>
            <Text style={styles.statLabel}>Prep</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{recipe.cookTime}m</Text>
            <Text style={styles.statLabel}>Cook</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{recipe.servings}</Text>
            <Text style={styles.statLabel}>Servings</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: DIFFICULTY_COLORS[recipe.difficulty] }]}>{recipe.difficulty}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Ingredients</Text>
        {ingredientsList.map((ing, i) => (
          <View key={i} style={styles.ingredientRow}>
            <View style={styles.bullet} />
            <Text style={styles.ingredientText}>{ing}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Instructions</Text>
        {instructionsList.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
            <Text style={styles.stepText}>{step.replace(/^\d+\.\s*/, "")}</Text>
          </View>
        ))}

        {recipe.author && (
          <View style={styles.authorBox}>
            <View style={styles.authorAvatar}><Text style={{ fontSize: 18, color: "#EA580C", fontWeight: "700" }}>{recipe.author.name[0]}</Text></View>
            <View>
              <Text style={styles.authorLabel}>Recipe by</Text>
              <Text style={styles.authorName}>{recipe.author.name}</Text>
            </View>
          </View>
        )}

        {reviews.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {reviews.slice(0, 5).map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.reviewAuthor}>{r.author?.name}</Text>
                  <Text style={{ color: "#FBBF24" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</Text>
                </View>
                {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  imageBox: { height: 220, backgroundColor: "#FFF7ED", alignItems: "center", justifyContent: "center", position: "relative" },
  favBtn: { position: "absolute", top: 16, right: 16, backgroundColor: "#fff", borderRadius: 22, width: 44, height: 44, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
  content: { padding: 20 },
  category: { fontSize: 13, color: "#EA580C", fontWeight: "600", marginBottom: 4 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827", marginBottom: 8 },
  description: { fontSize: 15, color: "#6B7280", lineHeight: 22 },
  statsRow: { flexDirection: "row", backgroundColor: "#FFF7ED", borderRadius: 16, padding: 16, marginTop: 16, marginBottom: 8 },
  statBox: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700", color: "#EA580C", textTransform: "capitalize" },
  statLabel: { fontSize: 11, color: "#9CA3AF", marginTop: 3 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginTop: 20, marginBottom: 12 },
  ingredientRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#EA580C", marginTop: 7 },
  ingredientText: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 20 },
  stepRow: { flexDirection: "row", gap: 12, marginBottom: 14, alignItems: "flex-start" },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#EA580C", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  stepNumText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  stepText: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 20 },
  authorBox: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderRadius: 14, padding: 14, marginTop: 20, borderWidth: 1, borderColor: "#F3F4F6" },
  authorAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFF7ED", alignItems: "center", justifyContent: "center" },
  authorLabel: { fontSize: 11, color: "#9CA3AF" },
  authorName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  reviewCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#F3F4F6" },
  reviewAuthor: { fontSize: 14, fontWeight: "600", color: "#111827" },
  reviewComment: { fontSize: 13, color: "#6B7280", marginTop: 6, lineHeight: 18 },
  errorText: { fontSize: 16, color: "#9CA3AF" },
});
