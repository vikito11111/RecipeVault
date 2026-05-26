import { pgTable, serial, text, varchar, integer, boolean, timestamp, pgEnum, decimal, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: roleEnum("role").notNull().default("user"),
  bio: text("bio"),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("users_email_idx").on(t.email),
]);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("categories_slug_idx").on(t.slug),
]);

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  ingredients: text("ingredients").notNull(),
  instructions: text("instructions").notNull(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  userId: integer("user_id").notNull().references(() => users.id),
  imageUrl: varchar("image_url", { length: 500 }),
  prepTime: integer("prep_time").notNull().default(0),
  cookTime: integer("cook_time").notNull().default(0),
  servings: integer("servings").notNull().default(4),
  difficulty: difficultyEnum("difficulty").notNull().default("medium"),
  isPublished: boolean("is_published").notNull().default(true),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("recipes_category_idx").on(t.categoryId),
  index("recipes_user_idx").on(t.userId),
  index("recipes_created_at_idx").on(t.createdAt),
  index("recipes_views_idx").on(t.views),
]);

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("reviews_recipe_idx").on(t.recipeId),
  index("reviews_user_idx").on(t.userId),
]);

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("favorites_user_idx").on(t.userId),
  uniqueIndex("favorites_unique_idx").on(t.userId, t.recipeId),
]);

export const usersRelations = relations(users, ({ many }) => ({
  recipes: many(recipes),
  reviews: many(reviews),
  favorites: many(favorites),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  recipes: many(recipes),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  category: one(categories, { fields: [recipes.categoryId], references: [categories.id] }),
  user: one(users, { fields: [recipes.userId], references: [users.id] }),
  reviews: many(reviews),
  favorites: many(favorites),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  recipe: one(recipes, { fields: [reviews.recipeId], references: [recipes.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  recipe: one(recipes, { fields: [favorites.recipeId], references: [recipes.id] }),
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
}));
