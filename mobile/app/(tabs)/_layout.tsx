import { Tabs } from "expo-router";
import { View, Text } from "react-native";

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", gap: 2 }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={{ fontSize: 10, color: focused ? "#EA580C" : "#9CA3AF", fontWeight: focused ? "600" : "400" }}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarShowLabel: false, tabBarStyle: { height: 60, borderTopColor: "#F3F4F6", paddingBottom: 4 }, headerShown: false, tabBarHideOnKeyboard: true }}>
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }} />
      <Tabs.Screen name="search" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" label="Search" focused={focused} /> }} />
      <Tabs.Screen name="favorites" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="♥" label="Saved" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }} />
    </Tabs>
  );
}
