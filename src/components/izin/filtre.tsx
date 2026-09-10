import { Modal, View, Text, Pressable } from "react-native";
import { X } from "lucide-react-native";
import { Control } from "react-hook-form";
import { NativeDatePicker } from "@/components/native-date-picker";
import { FormSelect } from "@/components/form/form-select";
import { format } from "date-fns";

type FiltreForm = { aciklama: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  control: Control<FiltreForm>;
  izinTipleri: { label: string; value: string }[];
  baslangic: string;
  bitis: string;
  onBaslangicChange: (value: string) => void;
  onBitisChange: (value: string) => void;
  onTemizle: () => void;
};

export function IzinFilterSheet({
  visible,
  onClose,
  control,
  izinTipleri,
  baslangic,
  bitis,
  onBaslangicChange,
  onBitisChange,
  onTemizle,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="rounded-t-2xl bg-white p-4 pb-8">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-qrz-navy">
              Filtrele
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={22} color="#0f172a" />
            </Pressable>
          </View>

          <View className="gap-4">
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className="mb-1 text-xs text-gray-500">Başlangıç</Text>
                <NativeDatePicker
                  value={new Date(baslangic)}
                  onChange={(date) =>
                    onBaslangicChange(format(date, "yyyy-MM-dd"))
                  }
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

            <FormSelect
              control={control}
              name="aciklama"
              label="İzin Tipi"
              options={[{ label: "Tümü", value: "" }, ...izinTipleri]}
            />
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
        </View>
      </View>
    </Modal>
  );
}
