import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Check, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Props = {
  visible: boolean;
  onClose: () => void;
  showEmpty: boolean;
  onShowEmptyChange: (value: boolean) => void;
  groups: { key: string; title: string }[];
  hiddenGroups: Set<string>;
  onToggleGroup: (key: string, visible: boolean) => void;
  onShowAll: () => void;
};

// Görünüm filtresi: boş alanları göster + bölüm seçimi. Değişiklikler anında uygulanır.
export function OzlukFiltreSheet({
  visible,
  onClose,
  showEmpty,
  onShowEmptyChange,
  groups,
  hiddenGroups,
  onToggleGroup,
  onShowAll,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          onPress={() => {}}
          className="max-h-[80%] rounded-t-3xl bg-white px-5 pt-4"
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

          <View className="flex-row items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
            <Text className="text-sm font-medium text-slate-700">Boş alanları göster</Text>
            <Switch checked={showEmpty} onCheckedChange={onShowEmptyChange} />
          </View>

          <View className="mb-1 mt-4 flex-row items-center justify-between">
            <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Bölümler
            </Text>
            {hiddenGroups.size > 0 && (
              <Pressable onPress={onShowAll} hitSlop={8}>
                <Text className="text-xs font-medium text-qrz-blue">Tümünü göster</Text>
              </Pressable>
            )}
          </View>

          <ScrollView>
            {groups.map((group) => {
              const checked = !hiddenGroups.has(group.key);
              return (
                <Pressable
                  key={group.key}
                  onPress={() => onToggleGroup(group.key, !checked)}
                  className="flex-row items-center gap-3 border-b border-slate-100 py-3"
                >
                  <View
                    className={cn(
                      "h-5 w-5 items-center justify-center rounded border",
                      checked ? "border-qrz-navy bg-qrz-navy" : "border-slate-300",
                    )}
                  >
                    {checked && <Check size={14} color="#FFFFFF" />}
                  </View>
                  <Text className="text-sm text-slate-700">{group.title}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable onPress={onClose} className="mt-4 items-center rounded-xl bg-qrz-navy py-3">
            <Text className="text-sm font-medium text-white">Tamam</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
