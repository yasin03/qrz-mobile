import { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, TextInput } from "react-native";
import { X } from "lucide-react-native";

type Props = {
  visible: boolean;
  personelAdi: string;
  onClose: () => void;
  onSubmit: (aciklama: string) => void;
};

export function RedAciklamaModal({
  visible,
  personelAdi,
  onClose,
  onSubmit,
}: Props) {
  const [aciklama, setAciklama] = useState("");

  useEffect(() => {
    if (visible) setAciklama("");
  }, [visible]);

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
              Talebi Reddet
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={22} color="#0f172a" />
            </Pressable>
          </View>

          <Text className="mb-2 text-xs text-gray-500">
            {personelAdi} için ret açıklaması girin.
          </Text>

          <TextInput
            value={aciklama}
            onChangeText={setAciklama}
            placeholder="Ret sebebi"
            multiline
            numberOfLines={3}
            className="rounded-lg border border-gray-200 p-3 text-sm text-gray-800"
            textAlignVertical="top"
          />

          <View className="mt-6 flex-row gap-3">
            <Pressable
              onPress={onClose}
              className="flex-1 items-center rounded-lg border border-gray-200 py-3"
            >
              <Text className="text-sm font-medium text-gray-500">Vazgeç</Text>
            </Pressable>
            <Pressable
              onPress={() => onSubmit(aciklama)}
              disabled={!aciklama.trim()}
              className="flex-1 items-center rounded-lg bg-red-600 py-3 disabled:opacity-40"
            >
              <Text className="text-sm font-medium text-white">Reddet</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
