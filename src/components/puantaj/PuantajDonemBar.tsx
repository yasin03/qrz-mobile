import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react-native";
import { getAyAdi } from "./puantaj-helpers";
import { PuantajDonemSecici, type Donem } from "./PuantajDonemSecici";

type Props = {
  donem: Donem;
  onChange: (donem: Donem) => void;
  /** Ay/yıl yazısının altında gösterilecek bilgi (ör. bölüm adı) */
  altBaslik?: string | null;
};

// Önceki / sonraki ay okları + ortada dokunulunca açılan ay/yıl seçici
export function PuantajDonemBar({ donem, onChange, altBaslik }: Props) {
  const [seciciOpen, setSeciciOpen] = useState(false);

  const ayDegistir = (fark: number) => {
    const tarih = new Date(donem.yil, donem.ay - 1 + fark, 1);
    onChange({ yil: tarih.getFullYear(), ay: tarih.getMonth() + 1 });
  };

  return (
    <>
      <View className="flex-row items-center justify-between rounded-2xl border border-slate-100 bg-white p-3">
        <Pressable
          onPress={() => ayDegistir(-1)}
          hitSlop={10}
          accessibilityLabel="Önceki ay"
          className="h-9 w-9 items-center justify-center rounded-full bg-slate-100"
        >
          <ChevronLeft size={20} color="#0f172a" />
        </Pressable>

        <Pressable
          onPress={() => setSeciciOpen(true)}
          accessibilityLabel="Ay ve yıl seç"
          className="items-center rounded-xl px-3 py-1 active:bg-slate-100"
        >
          <View className="flex-row items-center gap-1">
            <Text className="text-base font-bold text-qrz-navy">
              {getAyAdi(donem.ay)} {donem.yil}
            </Text>
            <ChevronDown size={16} color="#052346" />
          </View>
          {altBaslik ? (
            <Text className="text-xs text-slate-500">{altBaslik}</Text>
          ) : null}
        </Pressable>

        <Pressable
          onPress={() => ayDegistir(1)}
          hitSlop={10}
          accessibilityLabel="Sonraki ay"
          className="h-9 w-9 items-center justify-center rounded-full bg-slate-100"
        >
          <ChevronRight size={20} color="#0f172a" />
        </Pressable>
      </View>

      <PuantajDonemSecici
        visible={seciciOpen}
        donem={donem}
        onClose={() => setSeciciOpen(false)}
        onSelect={onChange}
      />
    </>
  );
}
