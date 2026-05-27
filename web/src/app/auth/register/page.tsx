import type { Metadata } from "next";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create Account — RecipeVault",
  description: "Join RecipeVault for free — share your own recipes, save favorites, rate dishes, and connect with thousands of food lovers worldwide.",
  openGraph: {
    title: "Create Account — RecipeVault",
    description: "Join the RecipeVault cooking community for free.",
    type: "website",
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
