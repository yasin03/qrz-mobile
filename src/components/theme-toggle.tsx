// src/components/theme-toggle.tsx
import { Pressable, Text, View } from "react-native";
import { Moon, Sun, SmartphoneIcon } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useThemeStore } from "@/stores/theme-store";

const OPTIONS = [
  { key: "light" as const, label: "Açık", icon: Sun },
  { key: "dark" as const, label: "Koyu", icon: Moon },
  { key: "system" as const, label: "Sistem", icon: SmartphoneIcon },
];

export function ThemeToggle() {
  const { mode, setMode } = useThemeStore();
  const { colorScheme } = useColorScheme();

  return (
    <View className="flex-row bg-secondary rounded-lg p-1 gap-1">
      {OPTIONS.map(({ key, label, icon: Icon }) => {
        const active = mode === key;
        return (
          <Pressable
            key={key}
            onPress={() => setMode(key)}
            className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-md py-2 ${
              active ? "bg-primary" : ""
            }`}
          >
            <Icon
              size={16}
              color={active ? "var(--primary-foreground)" : "var(--muted-foreground)"}
            />
            <Text
              className={`text-xs font-medium ${
                active ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}