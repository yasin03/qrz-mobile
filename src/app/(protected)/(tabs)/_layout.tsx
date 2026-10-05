import { TAB_BAR_HEIGHT, TabBarMenu } from "@/components/tab-bar-menu";
import { Tabs } from "expo-router";
import { Clock, House, QrCode, UserCircle } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProtectedLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View className="flex-1">
      <Tabs
        // Menü açıkken başka bir tab'a basılırsa menü kapansın
        screenListeners={{ tabPress: () => setMenuOpen(false) }}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: isDark ? "#01BBE6" : "#052346",
          tabBarInactiveTintColor: isDark ? "#94A3B8" : "#64748B",
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
          tabBarStyle: {
            height: TAB_BAR_HEIGHT + insets.bottom,
            paddingTop: 6,
            backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
            borderTopColor: isDark ? "#1E293B" : "#E2E8F0",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Ana Sayfa",
            tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="pdks"
          options={{
            title: "PDKS",
            tabBarIcon: ({ color, size }) => <Clock color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: "Menü",
            // Ortadaki slot boş kalır; yuvarlak buton TabBarMenu katmanında çizilir
            tabBarButton: () => <View className="flex-1" />,
          }}
        />
        <Tabs.Screen
          name="qr-tara"
          options={{
            title: "QR Tara",
            tabBarIcon: ({ color, size }) => <QrCode color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profilim",
            tabBarIcon: ({ color, size }) => (
              <UserCircle color={color} size={size} />
            ),
          }}
        />
        {/* Lokasyonlar tab'dan kaldırıldı */}
        <Tabs.Screen name="lokasyonlar" options={{ href: null }} />
      </Tabs>

      <TabBarMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        bottomInset={insets.bottom}
      />
    </View>
  );
}
