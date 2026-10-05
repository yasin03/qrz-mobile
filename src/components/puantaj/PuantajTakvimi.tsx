import { useMemo } from "react";
import { Text, View } from "react-native";
import type { PuantajSelectResponseType } from "@/types/puantaj";
import { cn } from "@/lib/utils";
import { HAFTA_DATA } from "@/constants/data";
import { getHaftaBilgisi, getPuantajBadge } from "./puantaj-helpers";

type Props = {
  kayit: PuantajSelectResponseType;
  yil: number;
  ay: number;
};

const HUCRE_GENISLIK = `${100 / 7}%` as const;

export function PuantajTakvimi({ kayit, yil, ay }: Props) {
  const gunSayisi = new Date(yil, ay, 0).getDate();
  const bosHucreSayisi = getHaftaBilgisi(yil, ay, 1).haftaNo - 1;

  const bugun = new Date();
  const buAyMi = bugun.getFullYear() === yil && bugun.getMonth() + 1 === ay;

  const gunler = useMemo(
    () =>
      Array.from({ length: gunSayisi }, (_, i) => {
        const gunNo = i + 1;
        return {
          gunNo,
          isWeekend: getHaftaBilgisi(yil, ay, gunNo).isWeekend,
          badge: getPuantajBadge(kayit[`G${gunNo}`]),
        };
      }),
    [gunSayisi, kayit, yil, ay],
  );

  return (
    <View className="rounded-2xl border border-slate-100 bg-white p-2">
      <View className="flex-row">
        {HAFTA_DATA.map((gun) => (
          <View key={gun.value} style={{ width: HUCRE_GENISLIK }} className="py-2">
            <Text
              className={cn(
                "text-center text-[11px] font-semibold",
                gun.isWeekend ? "text-red-500" : "text-slate-500",
              )}
            >
              {gun.shortTr}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {Array.from({ length: bosHucreSayisi }, (_, i) => (
          <View key={`bos-${i}`} style={{ width: HUCRE_GENISLIK }} />
        ))}

        {gunler.map((gun) => {
          const bugunMu = buAyMi && bugun.getDate() === gun.gunNo;
          return (
            <View key={gun.gunNo} style={{ width: HUCRE_GENISLIK }} className="p-0.5">
              <View
                className={cn(
                  "h-16 items-center justify-between rounded-lg border py-1.5",
                  bugunMu ? "border-qrz-blue" : "border-slate-100",
                  gun.isWeekend ? "bg-red-50/40" : "bg-white",
                )}
              >
                <Text
                  className={cn(
                    "text-xs font-semibold",
                    gun.isWeekend ? "text-red-500" : "text-slate-700",
                  )}
                >
                  {gun.gunNo}
                </Text>

                {gun.badge ? (
                  <View className={cn("min-w-8 items-center rounded-md px-1 py-0.5", gun.badge.bgClassName)}>
                    <Text
                      className={cn("text-[11px] font-bold", gun.badge.textClassName)}
                      numberOfLines={1}
                    >
                      {gun.badge.label}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-[11px] text-slate-300">—</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
