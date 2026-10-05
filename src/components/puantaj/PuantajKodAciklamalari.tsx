import { Text, View } from "react-native";
import { Info } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { PUANTAJ_KOD_ACIKLAMALARI } from "./puantaj-helpers";

export function PuantajKodAciklamalari() {
  return (
    <View className="rounded-2xl border border-slate-100 bg-white p-4">
      <View className="mb-3 flex-row items-center gap-2">
        <Info size={16} color="#64748B" />
        <Text className="text-sm font-semibold text-qrz-navy">
          Kod Açıklamaları
        </Text>
      </View>

      <View className="flex-row flex-wrap">
        {PUANTAJ_KOD_ACIKLAMALARI.map((item) => (
          <View key={item.kod} className="mb-2 w-1/2 flex-row items-center gap-2 pr-2">
            <View className={cn("min-w-9 items-center rounded-md px-1.5 py-0.5", item.bgClassName)}>
              <Text className={cn("text-[11px] font-bold", item.textClassName)}>
                {item.kod}
              </Text>
            </View>
            <Text className="flex-1 text-xs text-slate-500" numberOfLines={1}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
