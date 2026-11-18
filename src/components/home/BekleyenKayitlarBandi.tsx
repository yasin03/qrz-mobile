import { CloudUpload } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import {
  kayitEtiketi,
  pdksKuyrukGonder,
} from "@/hooks/use-pdks-kuyruk-senkron";
import { useBekleyenKayitlar } from "@/lib/pdks-kuyruk";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Sunucuya ulaşılamadığı için telefonda bekleyen QR kayıtlarını gösterir.
 * Kayıtlar otomatik gönderilir; "Şimdi gönder" beklemeden dener.
 */
export function BekleyenKayitlarBandi() {
  const idKullanici = useAuthStore((s) => s.user?.IDKullanici);
  const kayitlar = useBekleyenKayitlar(idKullanici);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  if (kayitlar.length === 0) return null;

  const simdiGonder = async () => {
    setGonderiliyor(true);
    try {
      await pdksKuyrukGonder();
    } finally {
      setGonderiliyor(false);
    }
  };

  return (
    <View className="mx-4 mb-4 gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
      <View className="flex-row items-center gap-2">
        <CloudUpload size={18} color="#b45309" />
        <Text className="flex-1 text-sm font-semibold text-amber-800">
          Gönderilmeyi bekleyen {kayitlar.length} kayıt
        </Text>
      </View>
      <Text className="text-xs text-amber-800">
        {kayitlar.map(kayitEtiketi).join(" · ")}
      </Text>
      <Text className="text-xs text-amber-700">
        Kayıtlar okutma saatiyle telefonunuzda saklandı; bağlantı sağlanınca
        otomatik gönderilecek. Tekrar okutmanıza gerek yok.
      </Text>
      <Pressable
        onPress={simdiGonder}
        disabled={gonderiliyor}
        className="mt-1 flex-row items-center justify-center gap-2 self-start rounded-lg bg-amber-600 px-3 py-2"
      >
        {gonderiliyor && <ActivityIndicator size="small" color="#ffffff" />}
        <Text className="text-sm font-medium text-white">
          {gonderiliyor ? "Gönderiliyor..." : "Şimdi gönder"}
        </Text>
      </Pressable>
    </View>
  );
}
