import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { cn } from "@/lib/utils";

type StatKartProps = {
  icon: LucideIcon;
  color: string;
  title: string;
  value: string;
  sub?: string | null;
  href?: Href;
  loading?: boolean;
  /** Tam genişlik (varsayılan: 2 sütunlu grid'de yarım) */
  wide?: boolean;
  right?: ReactNode;
};

// Dashboard'daki tekil özet kartı. Dokununca ilgili sayfaya gider.
export function StatKart({
  icon: Icon,
  color,
  title,
  value,
  sub,
  href,
  loading,
  wide,
  right,
}: StatKartProps) {
  const router = useRouter();

  return (
    <Pressable
      disabled={!href}
      onPress={() => href && router.push(href)}
      className={cn(
        "mb-3 rounded-2xl border border-slate-100 bg-white p-3.5 active:bg-slate-50",
        wide ? "w-full" : "w-[48.5%]",
      )}
    >
      <View className="flex-row items-center gap-2">
        <View
          className="h-8 w-8 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}1A` }}
        >
          <Icon size={16} color={color} />
        </View>
        <Text className="flex-1 text-xs font-medium text-slate-500" numberOfLines={1}>
          {title}
        </Text>
        {right}
      </View>

      {loading ? (
        <View className="mt-3 gap-1.5">
          <View className="h-5 w-2/3 rounded-md bg-slate-100" />
          <View className="h-3 w-full rounded-md bg-slate-100" />
        </View>
      ) : (
        <>
          <Text
            className="mt-2.5 text-lg font-bold text-qrz-navy"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {value}
          </Text>
          {sub ? (
            <Text className="mt-0.5 text-[11px] text-slate-500" numberOfLines={2}>
              {sub}
            </Text>
          ) : null}
        </>
      )}
    </Pressable>
  );
}

export function BolumBaslik({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View className="mb-2 mt-3 flex-row items-center justify-between">
      <Text className="text-base font-bold text-qrz-navy">{title}</Text>
      {right}
    </View>
  );
}

export function KartGrid({ children }: { children: ReactNode }) {
  return <View className="flex-row flex-wrap justify-between">{children}</View>;
}

type ListeSatiriProps = {
  title: string;
  sub?: string | null;
  right?: string | null;
  href?: Href;
  isLast?: boolean;
};

export function ListeSatiri({ title, sub, right, href, isLast }: ListeSatiriProps) {
  const router = useRouter();
  return (
    <Pressable
      disabled={!href}
      onPress={() => href && router.push(href)}
      className={cn(
        "flex-row items-center gap-3 px-4 py-3 active:bg-slate-50",
        !isLast && "border-b border-slate-50",
      )}
    >
      <View className="flex-1">
        <Text className="text-sm font-medium text-qrz-navy" numberOfLines={1}>
          {title}
        </Text>
        {sub ? (
          <Text className="text-xs text-slate-500" numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
      {right ? <Text className="text-xs font-semibold text-slate-600">{right}</Text> : null}
      {href ? <ChevronRight size={16} color="#CBD5E1" /> : null}
    </Pressable>
  );
}
