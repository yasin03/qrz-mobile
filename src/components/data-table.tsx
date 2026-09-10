import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronRight } from "lucide-react-native";

type Column<T> = {
  key: string;
  label: string;
  flex: number;
  render: (item: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyText?: string;
  renderAction?: (item: T) => React.ReactNode;
  renderDetail?: (item: T) => React.ReactNode;
};

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyText = "Kayıt bulunamadı",
  renderAction,
  renderDetail,
}: DataTableProps<T>) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (data.length === 0) {
    return <Text className="py-6 text-center text-sm text-gray-400">{emptyText}</Text>;
  }

  return (
    <View className="flex-1">
      <View className="flex-row border-b border-gray-200 bg-gray-50 py-2">
        {columns.map((col) => (
          <Text key={col.key} style={{ flex: col.flex }} className="px-1 text-xs font-semibold text-gray-500">
            {col.label}
          </Text>
        ))}
        <View style={{ width: 36 }} />
      </View>

      {data.map((item) => {
        const key = keyExtractor(item);
        const isExpanded = expandedKey === key;

        return (
          <View key={key}>
            <Pressable
              onPress={() => renderDetail && setExpandedKey(isExpanded ? null : key)}
              className="flex-row items-center border-b border-gray-100 py-2.5"
            >
              {columns.map((col) => (
                <View key={col.key} style={{ flex: col.flex }} className="px-1">
                  {col.render(item)}
                </View>
              ))}
              <View style={{ width: 36 }} className="items-center">
                {renderAction ? (
                  renderAction(item)
                ) : renderDetail ? (
                  <ChevronRight
                    size={16}
                    color="#9ca3af"
                    style={{ transform: [{ rotate: isExpanded ? "90deg" : "0deg" }] }}
                  />
                ) : null}
              </View>
            </Pressable>

            {isExpanded && renderDetail && (
              <View className="border-b border-gray-100 bg-gray-50 px-3 py-3">
                {renderDetail(item)}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}