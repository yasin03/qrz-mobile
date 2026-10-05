import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Check, Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { FlatList, Modal, Pressable, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Field } from "./field";

export type MultiSelectOption = {
  value: string;
  label: string;
  /** Aramaya dahil edilen ve satırda küçük gösterilen ek bilgi (ör. sicil no) */
  description?: string;
};

type FormMultiSelectProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  options: MultiSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  required?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
};

// Arama yapılabilen, alttan açılan çoklu seçim. Form değeri string[].
export function FormMultiSelect<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder = "Seçiniz",
  searchPlaceholder = "Ara...",
  emptyMessage = "Sonuç bulunamadı.",
  required,
  disabled,
  isLoading,
}: FormMultiSelectProps<T>) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [arama, setArama] = useState("");

  const filtreli = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr-TR");
    if (!q) return options;
    return options.filter((o) =>
      [o.label, o.description].some((v) => v?.toLocaleLowerCase("tr-TR").includes(q)),
    );
  }, [options, arama]);

  const kapat = () => {
    setVisible(false);
    setArama("");
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState }) => {
        const secili: string[] = Array.isArray(value) ? value : [];
        const seciliSet = new Set(secili);

        const toggle = (v: string) =>
          onChange(seciliSet.has(v) ? secili.filter((x) => x !== v) : [...secili, v]);

        const tumunuSec = () => {
          const gorunen = filtreli.map((o) => o.value);
          const hepsiSecili = gorunen.every((v) => seciliSet.has(v));
          onChange(
            hepsiSecili
              ? secili.filter((v) => !gorunen.includes(v))
              : Array.from(new Set([...secili, ...gorunen])),
          );
        };

        const ozet =
          secili.length === 0
            ? isLoading
              ? "Yükleniyor..."
              : placeholder
            : secili.length === 1
              ? (options.find((o) => o.value === secili[0])?.label ?? "1 seçili")
              : `${secili.length} personel seçili`;

        return (
          <Field label={label} required={required} error={fieldState.error?.message}>
            <Button
              variant="outline"
              disabled={disabled || isLoading}
              onPress={() => setVisible(true)}
            >
              <Text className={cn(secili.length === 0 && "text-muted-foreground")}>{ozet}</Text>
            </Button>

            <Modal visible={visible} transparent animationType="slide" onRequestClose={kapat}>
              <Pressable className="flex-1 justify-end bg-black/40" onPress={kapat}>
                <Pressable
                  onPress={() => {}}
                  className="max-h-[80%] rounded-t-2xl bg-white px-4 pt-4"
                  style={{ paddingBottom: insets.bottom + 12 }}
                >
                  <View className="mb-3 flex-row items-center justify-between">
                    <Text className="text-base font-medium text-qrz-navy">{label}</Text>
                    <TouchableOpacity onPress={tumunuSec} hitSlop={10}>
                      <Text className="text-sm font-medium text-qrz-blue">Tümünü Seç</Text>
                    </TouchableOpacity>
                  </View>

                  <Input
                    value={arama}
                    onChangeText={setArama}
                    placeholder={searchPlaceholder}
                    startIcon={<Search size={16} color="#64748B" />}
                    autoCorrect={false}
                    containerClassName="mb-2"
                  />

                  <FlatList
                    data={filtreli}
                    keyExtractor={(item) => item.value}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                      <Text className="py-6 text-center text-sm text-muted-foreground">
                        {emptyMessage}
                      </Text>
                    }
                    renderItem={({ item }) => {
                      const isSelected = seciliSet.has(item.value);
                      return (
                        <TouchableOpacity
                          className="flex-row items-center gap-3 border-b border-gray-100 py-3"
                          onPress={() => toggle(item.value)}
                        >
                          <View
                            className={cn(
                              "h-5 w-5 items-center justify-center rounded border",
                              isSelected ? "border-qrz-navy bg-qrz-navy" : "border-gray-300",
                            )}
                          >
                            {isSelected && <Check size={14} color="#FFFFFF" />}
                          </View>
                          <View className="flex-1">
                            <Text>{item.label}</Text>
                            {item.description ? (
                              <Text className="text-xs text-muted-foreground">{item.description}</Text>
                            ) : null}
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                  />

                  <Button className="mt-3" onPress={kapat}>
                    <Text>Tamam{secili.length ? ` (${secili.length})` : ""}</Text>
                  </Button>
                </Pressable>
              </Pressable>
            </Modal>
          </Field>
        );
      }}
    />
  );
}
