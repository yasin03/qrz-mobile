import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Info, Pencil, Search, SlidersHorizontal, Trash2 } from "lucide-react-native";

import { Input } from "@/components/ui/input";
import {
  useDeleteEklenti,
  useDeleteKesinti,
  useEklentiList,
  useKesintiList,
} from "@/hooks/use-bordro-parametre";
import { useRole } from "@/hooks/use-role";
import { usePersonelSabitTanimlar } from "@/hooks/use-sabit-tanimlar";
import { formatMoney, formatTarih } from "@/lib/format-helpers";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { confirm } from "@/stores/dialog-store";
import {
  eklentiToKayit,
  getDefaultParametreFiltre,
  kesintiToKayit,
  PARAMETRE_CONFIG,
  type ParametreFiltre,
  type ParametreKaydi,
  type ParametreTur,
} from "./parametre-config";
import { ParametreFiltreSheet } from "./ParametreFiltreSheet";

type Props = {
  tur: ParametreTur;
};

// Eklenti / kesinti listesi.
// Personel: sadece kendi kayıtlarını görür.
// Admin / yönetici: şubedeki tüm kayıtları görür, düzenler ve siler.
export function ParametreListesi({ tur }: Props) {
  const router = useRouter();
  const config = PARAMETRE_CONFIG[tur];
  const user = useAuthStore((state) => state.user);
  const { isPersonel } = useRole();
  const { eklentiTipleri, kesintiTipleri } = usePersonelSabitTanimlar();
  const tipler = tur === "eklenti" ? eklentiTipleri : kesintiTipleri;

  const [filtre, setFiltre] = useState<ParametreFiltre>(getDefaultParametreFiltre);
  const [filtreOpen, setFiltreOpen] = useState(false);
  const [arama, setArama] = useState("");

  // Personel kendi kaydını, admin ve yönetici şubedeki tüm personelleri (0) görür
  const selectParams = {
    IDSube: user?.IDSube ?? "",
    IDSubePersonel: isPersonel ? String(user?.IDSubePersonel ?? "0") : "0",
    Tarih1: filtre.Tarih1,
    Tarih2: filtre.Tarih2,
  };

  const eklentiQuery = useEklentiList(selectParams, tur === "eklenti");
  const kesintiQuery = useKesintiList(selectParams, tur === "kesinti");
  const deleteEklenti = useDeleteEklenti();
  const deleteKesinti = useDeleteKesinti();

  const { isLoading, isRefetching, refetch } =
    tur === "eklenti" ? eklentiQuery : kesintiQuery;

  const kayitlar = useMemo<ParametreKaydi[]>(
    () =>
      tur === "eklenti"
        ? (eklentiQuery.data ?? []).map(eklentiToKayit)
        : (kesintiQuery.data ?? []).map(kesintiToKayit),
    [tur, eklentiQuery.data, kesintiQuery.data],
  );

  const tipAdlari = useMemo(
    () => new Map(tipler.map((t) => [t.value, t.label])),
    [tipler],
  );

  // Tip, net/brüt ve ad/bölüm proc parametresi olmadığı için client-side filtreleniyor
  const liste = useMemo(() => {
    let data = kayitlar;
    if (filtre.Tip !== "ALL") data = data.filter((k) => k.tipKod === filtre.Tip);
    if (config.netVar && filtre.Net !== "ALL") {
      const isNet = filtre.Net === "NET";
      data = data.filter((k) => k.net === isNet);
    }
    const q = arama.trim().toLocaleLowerCase("tr-TR");
    if (!isPersonel && q) {
      data = data.filter((k) =>
        [k.AdSoyad, k.BolumAdi].some((v) => v?.toLocaleLowerCase("tr-TR").includes(q)),
      );
    }
    return data;
  }, [kayitlar, filtre.Tip, filtre.Net, config.netVar, arama, isPersonel]);

  const toplam = useMemo(() => liste.reduce((sum, k) => sum + k.tutar, 0), [liste]);

  const filtreAktif = filtre.Tip !== "ALL" || filtre.Net !== "ALL";
  const tarihOzet = `${format(new Date(filtre.Tarih1), "d MMM", { locale: tr })} – ${format(
    new Date(filtre.Tarih2),
    "d MMM yyyy",
    { locale: tr },
  )}`;

  const handleDuzenle = (kayit: ParametreKaydi) => {
    router.push({
      pathname: config.ekleHref as string,
      params: {
        id: kayit.id,
        AdSoyad: kayit.AdSoyad,
        BolumAdi: kayit.BolumAdi,
        tutar: String(kayit.tutar),
        tarih: kayit.tarih,
        tip: kayit.tipKod,
        net: kayit.net ? "1" : "0",
      },
    } as Href);
  };

  const handleSil = async (kayit: ParametreKaydi) => {
    const ok = await confirm({
      title: `${config.tekil} kaydını sil`,
      description: `${kayit.AdSoyad} - ${formatMoney(kayit.tutar)} ₺ tutarındaki kayıt kalıcı olarak silinecek. Onaylıyor musunuz?`,
      confirmText: "Sil",
      variant: "destructive",
    });
    if (!ok) return;

    const onError = () =>
      Alert.alert("Hata", `${config.tekil} kaydı silinemedi. Lütfen tekrar deneyiniz.`);

    if (tur === "eklenti") {
      deleteEklenti.mutate({ IDSubePersonelYardim: Number(kayit.id) }, { onError });
    } else {
      deleteKesinti.mutate({ IDSubePersonelOzelKesinti: Number(kayit.id) }, { onError });
    }
  };

  const header = (
    <View className="gap-3 pb-3">
      <View
        className="rounded-2xl p-4"
        style={{ backgroundColor: `${config.renk}14` }}
      >
        <Text className="text-xs font-medium text-slate-500">
          Toplam {config.tekil.toLocaleLowerCase("tr-TR")}
        </Text>
        <Text className="mt-1 text-2xl font-bold" style={{ color: config.renk }}>
          {formatMoney(toplam)} ₺
        </Text>
        <Text className="mt-1 text-xs text-slate-500">
          {liste.length} kayıt · {tarihOzet}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        {!isPersonel && (
          <Input
            value={arama}
            onChangeText={setArama}
            placeholder="Ad veya bölüm ara"
            startIcon={<Search size={16} color="#64748B" />}
            containerClassName="h-11 flex-1 rounded-xl border-slate-200 bg-white"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        )}
        <Pressable
          onPress={() => setFiltreOpen(true)}
          className={cn(
            "h-11 flex-row items-center gap-2 rounded-xl border px-3",
            isPersonel && "flex-1 justify-between",
            filtreAktif ? "border-qrz-navy bg-qrz-light" : "border-slate-200 bg-white",
          )}
        >
          {isPersonel && <Text className="text-xs text-slate-600">{tarihOzet}</Text>}
          <View className="flex-row items-center gap-1.5">
            <SlidersHorizontal size={16} color="#052346" />
            <Text className="text-xs font-medium text-qrz-navy">Filtre</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );

  return (
    <>
      <FlatList
        data={isLoading ? [] : liste}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View className="h-2" />}
        contentContainerClassName="p-4"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          isLoading ? (
            <View className="h-48 items-center justify-center">
              <ActivityIndicator color="#052346" />
            </View>
          ) : (
            <View className="h-48 items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white">
              <Info size={24} color="#94A3B8" />
              <Text className="text-sm text-slate-500">
                Bu aralıkta {config.tekil.toLocaleLowerCase("tr-TR")} kaydı bulunamadı.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const Icon = config.icon;
          const tipAdi = item.tipAdi || tipAdlari.get(item.tipKod) || item.tipKod;
          return (
            <View className="flex-row items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3">
              <View
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${config.renk}1A` }}
              >
                <Icon size={20} color={config.renk} />
              </View>

              <View className="flex-1">
                <Text className="text-sm font-semibold text-qrz-navy" numberOfLines={1}>
                  {isPersonel ? tipAdi : item.AdSoyad}
                </Text>
                <Text className="text-xs text-slate-500" numberOfLines={1}>
                  {isPersonel
                    ? formatTarih(item.tarih)
                    : [tipAdi, item.BolumAdi].filter(Boolean).join(" · ")}
                </Text>
                {!isPersonel && (
                  <Text className="text-[11px] text-slate-400">{formatTarih(item.tarih)}</Text>
                )}
              </View>

              <View className="items-end gap-1">
                <Text className="text-sm font-bold" style={{ color: config.renk }}>
                  {config.isaret}
                  {formatMoney(item.tutar)} ₺
                </Text>
                {config.netVar && (
                  <View
                    className={cn(
                      "rounded-md px-1.5 py-0.5",
                      item.net ? "bg-sky-50" : "bg-amber-50",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-[10px] font-semibold",
                        item.net ? "text-sky-600" : "text-amber-600",
                      )}
                    >
                      {item.net ? "Net" : "Brüt"}
                    </Text>
                  </View>
                )}
              </View>

              {/* Personel sadece görüntüler; düzenleme / silme admin ve yöneticide */}
              {!isPersonel && (
                <View className="ml-1 gap-2">
                  <Pressable
                    onPress={() => handleDuzenle(item)}
                    hitSlop={8}
                    accessibilityLabel="Düzenle"
                    className="h-8 w-8 items-center justify-center rounded-full bg-slate-100"
                  >
                    <Pencil size={14} color="#052346" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleSil(item)}
                    hitSlop={8}
                    accessibilityLabel="Sil"
                    className="h-8 w-8 items-center justify-center rounded-full bg-red-50"
                  >
                    <Trash2 size={14} color="#DC2626" />
                  </Pressable>
                </View>
              )}
            </View>
          );
        }}
      />

      <ParametreFiltreSheet
        tur={tur}
        visible={filtreOpen}
        filtre={filtre}
        tipler={tipler}
        onClose={() => setFiltreOpen(false)}
        onApply={setFiltre}
      />
    </>
  );
}
