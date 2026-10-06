import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { CheckCircle2, ChevronDown, XCircle, type LucideIcon } from "lucide-react-native";
import { cn } from "@/lib/utils";

// null → "-" olarak gösterilir; boolean → Evet / Hayır
export type BilgiDegeri = string | boolean | null;
export type BilgiAlani = { label: string; value: BilgiDegeri };

function DegerView({ value }: { value: BilgiDegeri }) {
  if (typeof value === "boolean") {
    return value ? (
      <View className="flex-row items-center gap-1">
        <CheckCircle2 size={14} color="#15803D" />
        <Text className="text-sm font-medium text-green-700">Evet</Text>
      </View>
    ) : (
      <View className="flex-row items-center gap-1">
        <XCircle size={14} color="#94A3B8" />
        <Text className="text-sm text-slate-400">Hayır</Text>
      </View>
    );
  }
  return (
    <Text className="flex-shrink text-right text-sm font-medium text-qrz-navy" selectable>
      {value ?? "-"}
    </Text>
  );
}

type Props = {
  title: string;
  icon: LucideIcon;
  fields: BilgiAlani[];
};

// Başlığına dokununca açılıp kapanan "etiket — değer" listesi kartı (Özlük, Bordro)
export function BilgiBolumu({ title, icon: Icon, fields }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <View className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <Pressable
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center gap-2 px-4 py-3 active:bg-slate-50"
      >
        <Icon size={16} color="#052346" />
        <Text className="flex-1 text-sm font-semibold text-qrz-navy">{title}</Text>
        <Text className="text-xs text-slate-400">{fields.length}</Text>
        <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
          <ChevronDown size={16} color="#94A3B8" />
        </View>
      </Pressable>

      {open && (
        <View className="border-t border-slate-100 px-4">
          {fields.map((f, i) => (
            <View
              key={f.label}
              className={cn(
                "flex-row items-start justify-between gap-4 py-2.5",
                i < fields.length - 1 && "border-b border-slate-50",
              )}
            >
              <Text className="text-sm text-slate-500">{f.label}</Text>
              <DegerView value={f.value} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
