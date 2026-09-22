import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
  ListRenderItemInfo,
} from "react-native";
import { ChevronDown } from "lucide-react-native";

export type DataTableColumn<T> = {
  key: string;
  label: string;
  flex?: number;
  width?: number;
  render?: (item: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];

  keyExtractor: (item: T, index: number) => string;

  emptyText?: string;

  renderDetail?: (item: T) => React.ReactNode;

  renderAction?: (item: T) => React.ReactNode;

  /** Aynı anda birden fazla satır açık olabilir */
  multipleExpanded?: boolean;

  /** Satıra basıldığında expand olsun */
  expandable?: boolean;

  /** Loading durumu */
  isLoading?: boolean;

  /** Verilir verilmez aşağı çekince yenileme (pull to refresh) etkinleşir */
  onRefresh?: () => void;

  /** Yenileme (pull to refresh) sırasında true olmalı */
  refreshing?: boolean;
};

export function CustomDataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyText = "Kayıt bulunamadı",
  renderDetail,
  renderAction,
  multipleExpanded = false,
  expandable = true,
  isLoading = false,
  onRefresh,
  refreshing = false,
}: DataTableProps<T>) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    new Set()
  );

  const toggleExpanded = (key: string) => {
    if (!expandable || !renderDetail) return;

    setExpandedKeys((prev) => {
      const next = new Set(prev);

      if (multipleExpanded) {
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
      } else {
        if (next.has(key)) {
          next.clear();
        } else {
          next.clear();
          next.add(key);
        }
      }

      return next;
    });
  };

  const renderHeader = () => (
    <View className="flex-row border-b border-gray-200 bg-gray-50 px-3 py-3">
      {columns.map((column) => (
        <View
          key={column.key}
          style={{
            flex: column.flex,
            width: column.width,
          }}
        >
          <Text className="text-xs font-semibold text-gray-500">
            {column.label}
          </Text>
        </View>
      ))}

      {(renderDetail || renderAction) && (
        <View className="w-8" />
      )}
    </View>
  );

  const renderItem = ({ item, index }: ListRenderItemInfo<T>) => {
    const key = keyExtractor(item, index);
    const isExpanded = expandedKeys.has(key);

    return (
      <View className="border-b border-gray-100 bg-white">
        <Pressable
          onPress={() => toggleExpanded(key)}
          disabled={!expandable || !renderDetail}
          className="min-h-[52px] flex-row items-center px-3 py-2 active:bg-gray-50"
        >
          {columns.map((column) => (
            <View
              key={column.key}
              style={{
                flex: column.flex,
                width: column.width,
              }}
              className="justify-center pr-2"
            >
              {column.render ? (
                column.render(item)
              ) : (
                <Text
                  numberOfLines={1}
                  className="text-sm text-gray-700"
                >
                  {String(
                    (item as Record<string, unknown>)[column.key] ?? "-"
                  )}
                </Text>
              )}
            </View>
          ))}

          <View className="w-8 items-center justify-center">
            {renderAction ? (
              renderAction(item)
            ) : renderDetail ? (
              <ChevronDown
                size={18}
                color="#9ca3af"
                style={{
                  transform: [
                    {
                      rotate: isExpanded ? "180deg" : "0deg",
                    },
                  ],
                }}
              />
            ) : null}
          </View>
        </Pressable>

        {isExpanded && renderDetail && (
          <View className="border-t border-gray-100 bg-gray-50 px-3 py-3">
            {renderDetail(item)}
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white">
      {renderHeader()}

      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        contentContainerStyle={
          data.length === 0
            ? { flexGrow: 1 }
            : undefined
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Text className="text-sm text-gray-400">
              {isLoading ? "Yükleniyor..." : emptyText}
            </Text>
          </View>
        }
      />
    </View>
  );
}