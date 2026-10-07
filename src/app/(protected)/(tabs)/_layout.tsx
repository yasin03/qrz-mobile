import { TAB_BAR_HEIGHT, TabBarMenu } from "@/components/tab-bar-menu";
import { Tabs } from "expo-router";
import type { BottomTabBarButtonProps } from "expo-router/build/react-navigation/bottom-tabs/types";
import { Clock, House, QrCode, UserCircle } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HIDDEN_SCREENS = [
  "lokasyonlar",
  "izinler",
  "avanslar",
  "puantaj",
  "bordro",
  "ozluk",
  "eklentiler",
  "kesintiler",
  "bildirimler",
  "location",
];

// tabBarStyle.paddingTop ile aynı; çizgi tab bar'ın üst kenarına otursun diye
const TAB_BAR_PADDING_TOP = 6;

// Aktif sekmenin üstünde ince bir çizgi gösteren tab butonu
function TabButton({
  children,
  style,
  onPress,
  onLongPress,
  testID,
  "aria-selected": selected,
  "aria-label": ariaLabel,
}: BottomTabBarButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      testID={testID}
      aria-label={ariaLabel}
      aria-selected={selected}
      accessibilityRole="tab"
      style={style}
    >
      {selected && (
        <View
          pointerEvents="none"
          className="absolute h-[2px] w-full self-center rounded-b-full bg-qrz-navy"
          style={{ top: -TAB_BAR_PADDING_TOP }}
        />
      )}
      {children}
    </Pressable>
  );
}

export default function ProtectedLayout() {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View className="flex-1">
      <Tabs
        // Gizli sayfalardan geri basınca bir önceki ekrana dönülsün (varsayılan: ilk sekme)
        backBehavior="history"
        // Menü açıkken başka bir tab'a basılırsa menü kapansın
        screenListeners={{ tabPress: () => setMenuOpen(false) }}
        screenOptions={{
          headerShown: false,
          tabBarButton: (props) => <TabButton {...props} />,
          tabBarActiveTintColor: "#052346",
          tabBarInactiveTintColor: "#64748B",
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
          tabBarStyle: {
            height: TAB_BAR_HEIGHT + insets.bottom,
            paddingTop: TAB_BAR_PADDING_TOP,
            backgroundColor: "#FFFFFF",
            borderTopColor: "#E2E8F0",
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
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
        {/* Tab bar'da görünmeyen ama tab bar'ın gösterildiği sayfalar (menüden açılır).
            popToTopOnBlur: başka sekmeye geçince iç stack sıfırlansın, menüden tekrar
            açıldığında detay değil liste ekranı gelsin. */}
        {HIDDEN_SCREENS.map((name) => (
          <Tabs.Screen key={name} name={name} options={{ href: null, popToTopOnBlur: true }} />
        ))}
      </Tabs>

      <TabBarMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        bottomInset={insets.bottom}
      />
    </View>
  );
}
