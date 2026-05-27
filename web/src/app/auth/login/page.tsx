import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In — RecipeVault",
  description: "Sign in to your RecipeVault account to manage your recipes, save favorites, and connect with the cooking community.",
  openGraph: {
    title: "Sign In — RecipeVault",
    description: "Access your RecipeVault account.",
    type: "website",
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
