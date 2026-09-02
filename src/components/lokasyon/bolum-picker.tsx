// components/bolum-picker.tsx
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Check } from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";



type BolumPickerProps = {
  bolumler: any[] | undefined;
  value: string;
  onChange: (idBolum: string) => void;
  isLoading?: boolean;
  isError?: boolean;
};

export function BolumPicker({
  bolumler,
  value,
  onChange,
  isLoading,
  isError,
}: BolumPickerProps) {
  const [visible, setVisible] = useState(false);

  const selected = bolumler?.find((b) => String(b.IDBolum) === value);

  const placeholder = isLoading
    ? "Bölümler yükleniyor..."
    : isError
      ? "Bölümler yüklenemedi"
      : "Bölüm seçiniz";

  return (
    <>
      <Button
        variant="outline"
        disabled={isLoading || isError}
        onPress={() => setVisible(true)}
      >
        <Text>{selected?.BolumAdi ?? placeholder}</Text>
      </Button>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setVisible(false)}
        >
          <Pressable className="max-h-[70%] rounded-t-2xl bg-white p-4">
            <Text className="mb-3 text-base font-medium text-qrz-navy">
              Bölüm Seçiniz
            </Text>
            <FlatList
              data={bolumler}
              keyExtractor={(item) => String(item.IDBolum)}
              renderItem={({ item }) => {
                const isSelected = String(item.IDBolum) === value;
                return (
                  <TouchableOpacity
                    className="flex-row items-center justify-between border-b border-gray-100 py-3"
                    onPress={() => {
                      onChange(String(item.IDBolum));
                      setVisible(false);
                    }}
                  >
                    <Text>{item.BolumAdi}</Text>
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