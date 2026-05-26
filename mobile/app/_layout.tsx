import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recipe/[id]" options={{ headerShown: true, headerTitle: "Recipe", headerBackTitle: "Back", headerTintColor: "#EA580C" }} />
        <Stack.Screen name="login" options={{ headerShown: true, headerTitle: "Sign In", headerBackTitle: "Back", headerTintColor: "#EA580C" }} />
        <Stack.Screen name="register" options={{ headerShown: true, headerTitle: "Create Account", headerBackTitle: "Back", headerTintColor: "#EA580C" }} />
      </Stack>
    </>
  );
}
