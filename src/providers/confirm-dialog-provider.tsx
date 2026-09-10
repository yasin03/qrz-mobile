import { Modal, View, Text, Pressable } from "react-native";
import { useDialogStore } from "@/stores/dialog-store";

export function ConfirmDialogProvider() {
  const { visible, options, handle } = useDialogStore();

  if (!options) return null;

  const isDestructive = options.variant === "destructive";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => handle(false)}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full max-w-sm rounded-2xl bg-white p-5">
          <Text className="text-base font-semibold text-qrz-navy">{options.title}</Text>
          {options.description ? (
            <Text className="mt-2 text-sm text-gray-500">{options.description}</Text>
          ) : null}

          <View className="mt-5 flex-row justify-end gap-3">
            <Pressable
              onPress={() => handle(false)}
              className="rounded-lg px-4 py-2"
            >
              <Text className="text-sm font-medium text-gray-500">
                {options.cancelText ?? "Vazgeç"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handle(true)}
              className={`rounded-lg px-4 py-2 ${isDestructive ? "bg-red-600" : "bg-qrz-navy"}`}
            >
              <Text className="text-sm font-medium text-white">
                {options.confirmText ?? "Onayla"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}