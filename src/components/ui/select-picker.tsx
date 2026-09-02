import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { FlatList, Modal, Pressable, TouchableOpacity } from "react-native";

export type SelectOption = { value: string; label: string };

type SelectPickerProps = {
  value?: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  title?: string;
  disabled?: boolean;
  isLoading?: boolean;
};

export function SelectPicker({
  value,
  onChange,
  options,
  placeholder = "Seçiniz",
  title,
  disabled,
  isLoading,
}: SelectPickerProps) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <Button
        variant="outline"
        disabled={disabled || isLoading}
        onPress={() => setVisible(true)}
      >
        <Text>{selected?.label ?? (isLoading ? "Yükleniyor..." : placeholder)}</Text>
      </Button>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setVisible(false)}>
          <Pressable className="max-h-[70%] rounded-t-2xl bg-white p-4">
            {title && <Text className="mb-3 text-base font-medium text-qrz-navy">{title}</Text>}
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    className="flex-row items-center justify-between border-b border-gray-100 py-3"
                    onPress={() => {
                      onChange(item.value);
                      setVisible(false);
                    }}
                  >
                    <Text>{item.label}</Text>
                    {isSelected && <Check size={18} />}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}