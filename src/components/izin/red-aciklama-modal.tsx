import { useState } from "react";
import { Modal, View, Text, Pressable, TextInput } from "react-native";
import { X } from "lucide-react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (redAciklama: string) => void;
  isSubmitting?: boolean;
};

export function RedAciklamaModal({
  visible,
  onClose,
  onConfirm,
  isSubmitting,
}: Props) {
  const [value, setValue] = useState("");

  const handleConfirm = () => {
    if (!value.trim()) return;
    onConfirm(value.trim());
    setValue("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full max-w-sm rounded-2xl bg-white p-5">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-qrz-navy">
              Red Gerekçesi
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={20} color="#0f172a" />
            </Pressable>
          </View>

          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Red sebebini yazınız"
            multiline
            numberOfLines={3}
            className="min-h-[80px] rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800"
            textAlignVertical="top"
          />

          <View className="mt-4 flex-row justify-end gap-3">
            <Pressable onPress={onClose} className="rounded-lg px-4 py-2">
              <Text className="text-sm font-medium text-gray-500">Vazgeç</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              disabled={!value.trim() || isSubmitting}
              className="rounded-lg bg-red-600 px-4 py-2 disabled:opacity-50"
            >
              <Text className="text-sm font-medium text-white">Reddet</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
