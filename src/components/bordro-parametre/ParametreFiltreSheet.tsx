import { useEffect, useMemo } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { useForm } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FormDatePicker } from "@/components/form/form-date-picker";
import { FormSelect } from "@/components/form/form-select";
import {
  getDefaultParametreFiltre,
  PARAMETRE_CONFIG,
  type ParametreFiltre,
  type ParametreTur,
} from "./parametre-config";

type Props = {
  tur: ParametreTur;
  visible: boolean;
  filtre: ParametreFiltre;
  tipler: { value: string; label: string }[];
  onClose: () => void;
  onApply: (filtre: ParametreFiltre) => void;
};

const NET_SECENEKLERI = [
  { value: "ALL", label: "Tümü" },
  { value: "NET", label: "Net" },
  { value: "BRUT", label: "Brüt" },
];

// Tarih aralığı + tip (+ eklentide net/brüt) filtresi. "Uygula" ile uygulanır.
export function ParametreFiltreSheet({ tur, visible, filtre, tipler, onClose, onApply }: Props) {
  const insets = useSafeAreaInsets();
  const config = PARAMETRE_CONFIG[tur];

  const tipOptions = useMemo(() => [{ value: "ALL", label: "Tümü" }, ...tipler], [tipler]);

  const { control, handleSubmit, reset } = useForm<ParametreFiltre>({
    defaultValues: filtre,
  });

  useEffect(() => {
    if (visible) reset(filtre);
  }, [visible, filtre, reset]);

  const uygula = handleSubmit((values) => {
    onApply(values);
    onClose();
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          onPress={() => {}}
          className="rounded-t-3xl bg-white px-5 pt-4"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-bold text-qrz-navy">Filtrele</Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              className="h-8 w-8 items-center justify-center rounded-full bg-slate-100"
            >
              <X size={18} color="#64748B" />
            </Pressable>
          </View>

          <View className="gap-3">
            <View className="flex-row gap-2">
              <View className="flex-1">
                <FormDatePicker control={control} name="Tarih1" label="Başlangıç" />
              </View>
              <View className="flex-1">
                <FormDatePicker control={control} name="Tarih2" label="Bitiş" />
              </View>
            </View>

            <FormSelect
              control={control}
              name="Tip"
              label={config.tipLabel}
              options={tipOptions}
            />

            {config.netVar && (
              <FormSelect
                control={control}
                name="Net"
                label="Net / Brüt"
                options={NET_SECENEKLERI}
              />
            )}
          </View>

          <View className="mt-5 flex-row gap-3">
            <Pressable
              onPress={() => reset(getDefaultParametreFiltre())}
              className="flex-1 items-center rounded-xl border border-slate-200 py-3"
            >
              <Text className="text-sm font-medium text-slate-600">Sıfırla</Text>
            </Pressable>
            <Pressable onPress={uygula} className="flex-1 items-center rounded-xl bg-qrz-navy py-3">
              <Text className="text-sm font-medium text-white">Uygula</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
