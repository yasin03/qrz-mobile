import { Text } from "@/components/ui/text";
import { useRouter, type Href } from "expo-router";
import {
  CalendarCheck,
  CalendarDays,
  Receipt,
  HandCoins,
  IdCard,
  LayoutGrid,
  MinusCircle,
  PlusCircle,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect } from "react";
import { BackHandler, Pressable, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
  ReduceMotion,
  ZoomIn,
} from "react-native-reanimated";

// Tab bar'ın içerik yüksekliği (safe area hariç). Layout ve menü aynı değeri kullanır.
export const TAB_BAR_HEIGHT = 64;
const MENU_BUTTON_SIZE = 70;
// Butonun tab bar'ın üstüne taşan kısmı
const MENU_BUTTON_OVERFLOW = 22;

type MenuItem = {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  href: Href;
};

const MENU_ITEMS: MenuItem[] = [
  { title: "İzinler", icon: CalendarCheck, iconColor: "#01BBE6", href: "/izinler" },
  { title: "Avanslar", icon: HandCoins, iconColor: "#F59E0B", href: "/avanslar" },
  { title: "Özlük", icon: IdCard, iconColor: "#6366F1", href: "/ozluk" },
  { title: "Eklentiler", icon: PlusCircle, iconColor: "#10B981", href: "/eklentiler" },
  { title: "Kesintiler", icon: MinusCircle, iconColor: "#EF4444", href: "/kesintiler" },
  { title: "Bordro", icon: Receipt, iconColor: "#0EA5E9", href: "/bordro" },
  { title: "Puantaj", icon: CalendarDays, iconColor: "#8B5CF6", href: "/puantaj" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bottomInset: number;
};

// Tab bar'ın üstünde duran katman: ortadaki yuvarlak buton + açılan menü.
// Tab bar'ı kapatmaz; menü açıkken de tab bar görünür ve tıklanabilir kalır.
export function TabBarMenu({ open, onOpenChange, bottomInset }: Props) {
  const router = useRouter();
  const tabBarHeight = TAB_BAR_HEIGHT + bottomInset;

  // Android geri tuşu menüyü kapatsın
  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onOpenChange(false);
      return true;
    });
    return () => sub.remove();
  }, [open, onOpenChange]);

  const handleItemPress = (href: Href) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <View pointerEvents="box-none" className="absolute inset-0">
      {open && (
        <View
          pointerEvents="box-none"
          className="absolute left-0 right-0 top-0 justify-end"
          style={{ bottom: tabBarHeight }}
        >
          <Animated.View
            entering={FadeIn.duration(180).reduceMotion(ReduceMotion.System)}
            exiting={FadeOut.duration(150).reduceMotion(ReduceMotion.System)}
            className="absolute inset-0 bg-black/40"
          >
            <Pressable
              className="flex-1"
              onPress={() => onOpenChange(false)}
              accessibilityLabel="Menüyü kapat"
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.springify().damping(50).reduceMotion(ReduceMotion.System)}
            exiting={FadeOutDown.duration(150).reduceMotion(ReduceMotion.System)}
            className="mx-4 rounded-3xl bg-card p-3 shadow-xl shadow-black/20"
            style={{ marginBottom: MENU_BUTTON_OVERFLOW + 14 }}
          >
            <Text className="mb-2 px-2 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Hızlı Menü
            </Text>

            <View className="flex-row flex-wrap">
              {MENU_ITEMS.map((item) => (
                <View key={item.title} className="w-1/3 p-1">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleItemPress(item.href)}
                    className="items-center rounded-2xl bg-background py-3"
                  >
                    <View
                      className="mb-2 h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${item.iconColor}1A` }}
                    >
                      <item.icon size={24} color={item.iconColor} />
                    </View>
                    <Text className="text-[13px] font-semibold text-qrz-navy dark:text-foreground">
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>
      )}

      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0 items-center"
        style={{
          bottom: tabBarHeight + MENU_BUTTON_OVERFLOW - MENU_BUTTON_SIZE,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onOpenChange(!open)}
          accessibilityRole="button"
          accessibilityLabel={open ? "Menüyü kapat" : "Menüyü aç"}
          accessibilityState={{ expanded: open }}
          className="items-center justify-center rounded-full border-4 border-card bg-qrz-navy shadow-lg shadow-black/25"
          style={{ width: MENU_BUTTON_SIZE, height: MENU_BUTTON_SIZE }}
        >
          <Animated.View
            key={open ? "kapat" : "ac"}
            entering={ZoomIn.duration(180).reduceMotion(ReduceMotion.System)}
          >
            {open ? (
              <X size={34} color="#FFFFFF" />
            ) : (
              <LayoutGrid size={32} color="#FFFFFF" />
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
