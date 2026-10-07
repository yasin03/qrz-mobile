import { SheetPanel } from "@/components/ui/sheet-panel";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AY_DATA, useYearOptions } from "@/constants/data";
import { cn } from "@/lib/utils";

export type Donem = { yil: number; ay: number };

type Props = {
  visible: boolean;
  donem: Donem;
  onClose: () => void;
  onSelect: (donem: Donem) => void;
};

// Alttan açılan ay / yıl seçici. Ay seçilince dönem uygulanır ve kapanır.
export function PuantajDonemSecici({ visible, donem, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const yilSecenekleri = useYearOptions(5, 0);
  const [seciliYil, setSeciliYil] = useState(donem.yil);

  useEffect(() => {
    if (visible) setSeciliYil(donem.yil);
  }, [visible, donem.yil]);

  const bugun = new Date();
  const buYil = bugun.getFullYear();
  const buAy = bugun.getMonth() + 1;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <SheetPanel>
          <Pressable
            onPress={() => {}}
            className="rounded-t-3xl bg-white px-5 pt-5"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-base font-bold text-qrz-navy">Dönem Seç</Text>
              <Pressable
                onPress={onClose}
                hitSlop={10}
                className="h-8 w-8 items-center justify-center rounded-full bg-slate-100"
              >
                <X size={18} color="#64748B" />
              </Pressable>
            </View>

            <Text className="mb-2 text-xs font-medium text-slate-500">Yıl</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 pb-1"
            >
              {yilSecenekleri.map((y) => {
                const aktif = Number(y) === seciliYil;
                return (
                  <Pressable
                    key={y}
                    onPress={() => setSeciliYil(Number(y))}
                    className={cn(
                      "rounded-full border px-4 py-2",
                      aktif ? "border-qrz-navy bg-qrz-navy" : "border-slate-200 bg-white",
                    )}
                  >
                    <Text className={cn("text-sm font-semibold", aktif ? "text-white" : "text-slate-700")}>
                      {y}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text className="mb-2 mt-4 text-xs font-medium text-slate-500">Ay</Text>
            <View className="flex-row flex-wrap justify-between">
              {AY_DATA.map((item) => {
                const ay = Number(item.value);
                const aktif = seciliYil === donem.yil && ay === donem.ay;
                const buDonem = seciliYil === buYil && ay === buAy;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => {
                      onSelect({ yil: seciliYil, ay });
                      onClose();
                    }}
                    className={cn(
                      "mb-2 w-[31.5%] items-center rounded-xl border py-3",
                      aktif
                        ? "border-qrz-navy bg-qrz-navy"
                        : buDonem
                          ? "border-qrz-blue bg-qrz-light"
                          : "border-slate-200 bg-white",
                    )}
                  >
                    <Text className={cn("text-sm font-semibold", aktif ? "text-white" : "text-slate-700")}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </SheetPanel>
      </Pressable>
    </Modal>
  );
}
