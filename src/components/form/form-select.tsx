import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { FlatList, Modal, Pressable, TouchableOpacity } from "react-native";

import { Field } from "./field";

export type SelectOption = { value: string; label: string };

type FormSelectProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  description?: string;
  className?: string;
  vertical?: boolean;
};

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder = "Seçiniz",
  required,
  disabled,
  isLoading,
  description,
  className,
  vertical = false,
}: FormSelectProps<T>) {
  const [visible, setVisible] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState }) => {
        const selected = options.find((o) => o.value === value);

        return (
          <Field
            label={label}
            required={required}
            description={description}
            error={fieldState.error?.message}
            vertical={vertical}
            className={className}
          >
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
                  {label && <Text className="mb-3 text-base font-medium text-qrz-navy">{label}</Text>}
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
          </Field>
        );
      }}
    />
  );
}