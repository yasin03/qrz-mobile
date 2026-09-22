import { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, BackHandler } from "react-native";
import { X } from "lucide-react-native";
import { NativeDatePicker } from "@/components/native-date-picker";
import { format } from "date-fns";

type Props = {
  visible: boolean;
  onClose: () => void;
  baslangic: string;
  bitis: string;
  onBaslangicChange: (value: string) => void;
  onBitisChange: (value: string) => void;
  onTemizle: () => void;
};

export function IzinTalepFiltreSheet({
  visible,
  onClose,
  baslangic,
  bitis,
  onBaslangicChange,
  onBitisChange,
  onTemizle,
}: Props) {
  const translateY = useRef(new Animated.Value(300)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: visible ? 0 : 300,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible]);

  if (!visible) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <Animated.View
        style={{ opacity }}
        className="absolute inset-0 bg-black/40"
      >
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={{ transform: [{ translateY }] }}
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white p-4 pb-8"
      >
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-base font-semibold text-qrz-navy">
            Filtrele
          </Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={22} color="#0f172a" />
          </Pressable>
        </View>

        <View className="flex-row gap-2">
          <View className="flex-1">
            <Text className="mb-1 text-xs text-gray-500">Başlangıç</Text>
            <NativeDatePicker
              value={new Date(baslangic)}
              onChange={(date) => onBaslangicChange(format(date, "yyyy-MM-dd"))}
            />
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-xs text-gray-500">Bitiş</Text>
            <NativeDatePicker
              value={new Date(bitis)}
              onChange={(date) => onBitisChange(format(date, "yyyy-MM-dd"))}
            />
          </View>
        </View>

        <View className="mt-6 flex-row gap-3">
          <Pressable
            onPress={onTemizle}
            className="flex-1 items-center rounded-lg border border-gray-200 py-3"
          >
            <Text className="text-sm font-medium text-gray-500">Temizle</Text>
          </Pressable>
          <Pressable
            onPress={onClose}
            className="flex-1 items-center rounded-lg bg-qrz-navy py-3"
          >
            <Text className="text-sm font-medium text-white">Uygula</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}
