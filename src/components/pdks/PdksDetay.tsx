import { ActivityIndicator, Text, View } from "react-native";
import { LogIn, LogOut, MapPin } from "lucide-react-native";

import { usePdksDetay } from "@/hooks/use-pdks";
import { PDKSSelectResponseType } from "@/types/pdks";
import { formatSaat } from "./pdks-helpers";

type Props = {
  kayit: PDKSSelectResponseType;
};

function SureSatiri({ label, value }: { label: string; value: string | null }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-sm font-medium text-gray-800">{value || "-"}</Text>
    </View>
  );
}

// Satır açılınca: günün süre özeti + o güne ait tüm giriş/çıkış hareketleri.
// Tablo detayı sadece açık satır için render ettiğinden istek de o an atılır.
export function PdksDetay({ kayit }: Props) {
  const {
    data: hareketler = [],
    isLoading,
    isError,
  } = usePdksDetay(kayit.IDSubePersonelSaat);

  return (
    <View className="gap-3 px-4">
      <View className="gap-2">
        <SureSatiri label="Normal Süre" value={kayit.NormalSure} />
        <SureSatiri label="Mesai" value={kayit.MesaiSure} />
        <SureSatiri label="İzin" value={kayit.IzinSure} />
        <SureSatiri label="Toplam" value={kayit.ToplamSure} />
      </View>

      <View className="gap-2 border-t border-gray-100 pt-3">
        <Text className="text-xs font-medium text-gray-400">Hareketler</Text>

        {isLoading ? (
          <ActivityIndicator size="small" color="#64748b" />
        ) : isError ? (
          <Text className="text-sm text-red-500">
            Hareketler yüklenemedi.
          </Text>
        ) : hareketler.length === 0 ? (
          <Text className="text-sm text-gray-500">Hareket kaydı yok.</Text>
        ) : (
          hareketler.map((hareket, index) => {
            const isGiris = hareket.Yon === "Giriş";
            const YonIcon = isGiris ? LogIn : LogOut;

            return (
              <View
                key={`${hareket.Tarih}-${index}`}
                className="flex-row items-center gap-3"
              >
                <View
                  className={`h-8 w-8 items-center justify-center rounded-full ${
                    isGiris ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <YonIcon size={16} color={isGiris ? "#16a34a" : "#dc2626"} />
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-800">
                    {hareket.Yon} · {formatSaat(hareket.Tarih)}
                  </Text>
                  {hareket.LokasyonAdi ? (
                    <View className="flex-row items-center gap-1">
                      <MapPin size={12} color="#94a3b8" />
                      <Text className="text-xs text-gray-500">
                        {hareket.LokasyonAdi}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}
