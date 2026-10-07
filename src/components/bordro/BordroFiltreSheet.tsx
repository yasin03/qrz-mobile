import { SheetPanel } from "@/components/ui/sheet-panel";
import { Modal, Pressable, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Switch } from "@/components/ui/switch";

type Props = {
  visible: boolean;
  onClose: () => void;
  showPersonal: boolean;
  onShowPersonalChange: (value: boolean) => void;
  showZeros: boolean;
  onShowZerosChange: (value: boolean) => void;
};

// Bordro görünüm filtresi (admin'deki popover ile aynı seçenekler). Anında uygulanır.
export function BordroFiltreSheet({
  visible,
  onClose,
  showPersonal,
  onShowPersonalChange,
  showZeros,
  onShowZerosChange,
}: Props) {
  const insets = useSafeAreaInsets();

  const satirlar = [
    { label: "Kişisel bilgileri göster", value: showPersonal, onChange: onShowPersonalChange },
    { label: "0 değerleri göster", value: showZeros, onChange: onShowZerosChange },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <SheetPanel>
          <Pressable
            onPress={() => {}}
            className="rounded-t-3xl bg-white px-5 pt-4"
            style={{ paddingBottom: insets.bottom + 12 }}
          >
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-base font-bold text-qrz-navy">Görünüm</Text>
              <Pressable
                onPress={onClose}
                hitSlop={10}
                className="h-8 w-8 items-center justify-center rounded-full bg-slate-100"
              >
                <X size={18} color="#64748B" />
              </Pressable>
            </View>

            <View className="gap-2">
              {satirlar.map((s) => (
                <View
                  key={s.label}
                  className="flex-row items-center justify-between rounded-xl bg-slate-50 px-3 py-3"
                >
                  <Text className="text-sm font-medium text-slate-700">{s.label}</Text>
                  <Switch checked={s.value} onCheckedChange={s.onChange} />
                </View>
              ))}
            </View>

            <Pressable onPress={onClose} className="mt-4 items-center rounded-xl bg-qrz-navy py-3">
              <Text className="text-sm font-medium text-white">Tamam</Text>
            </Pressable>
          </Pressable>
        </SheetPanel>
      </Pressable>
    </Modal>
  );
}
