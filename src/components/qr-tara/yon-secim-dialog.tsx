import { SheetPanel } from "@/components/ui/sheet-panel";
import { PdksYon } from "@/types/pdks";
import { LocationEdit, LogIn, LogOut, X } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";

type Props = {
  visible: boolean;
  onSelect: (yon: PdksYon) => void;
  onClose: () => void;
  showLocationButton: boolean;
  onLocationPress: () => void;
};

export function YonSecimDialog({
  visible,
  onSelect,
  onClose,
  showLocationButton,
  onLocationPress,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <SheetPanel>
          <View className="rounded-t-3xl bg-white px-5 pb-8 pt-5">
            {/* Header */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-qrz-navy">
                İşlem Seçin
              </Text>

              <Pressable
                onPress={onClose}
                className="rounded-full bg-gray-100 p-2"
              >
                <X size={18} color="#64748b" />
              </Pressable>
            </View>

            {/* Giriş / Çıkış */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => onSelect("Giriş")}
                className="flex-1 items-center gap-2 rounded-2xl bg-green-600 py-6"
              >
                <LogIn size={32} color="white" />
                <Text className="text-base font-semibold text-white">
                  Giriş
                </Text>
              </Pressable>

              <Pressable
                onPress={() => onSelect("Çıkış")}
                className="flex-1 items-center gap-2 rounded-2xl bg-red-600 py-6"
              >
                <LogOut size={32} color="white" />
                <Text className="text-base font-semibold text-white">
                  Çıkış
                </Text>
              </Pressable>
            </View>

            {/* Lokasyon kaydetme (admin / yönetici) */}
            {showLocationButton && (
              <Pressable
                onPress={onLocationPress}
                className="mt-4 flex-row items-center justify-center gap-2 rounded-xl border border-gray-200 py-3"
              >
                <LocationEdit size={20} color="#1e293b" />
                <Text className="font-medium text-gray-700">
                  Lokasyon Kaydet
                </Text>
              </Pressable>
            )}
          </View>
        </SheetPanel>
      </View>
    </Modal>
  );
}
