import { ShieldOff } from "lucide-react-native";
import { ReactNode } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { usePersonelYetki } from "@/hooks/use-per-yetki";
import type { PerYetkiKey } from "@/types/per-yetki";

type Props = {
  yetki: PerYetkiKey;
  children: ReactNode;
};

// Personel, admin'in kapattığı bir ekrana (ör. bildirim/derin link ile)
// ulaşırsa içeriği göstermez. Asıl koruma API tarafında.
export function PersonelYetkiGuard({ yetki, children }: Props) {
  const { can, isLoading } = usePersonelYetki();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#052346" />
      </View>
    );
  }

  if (!can(yetki)) {
    return (
      <View className="flex-1 items-center justify-center gap-2 px-6">
        <ShieldOff size={28} color="#64748B" />
        <Text className="text-center text-sm text-muted-foreground">
          Bu sayfayı görüntüleme yetkiniz bulunmuyor.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}
