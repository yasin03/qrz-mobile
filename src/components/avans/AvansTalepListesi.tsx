import { useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import {  SlidersHorizontal, Check, X } from "lucide-react-native";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  useAvansTalepleri,
  useUpdateAvansTalep,
} from "@/hooks/use-avans";
import { getDefaultIzinTarihAraligi } from "@/lib/date-helpers";
import { confirm } from "@/stores/dialog-store";
import { RedAciklamaModal } from "@/components/avans/red-aciklama-modal";
import { AvansFilterSheet } from "@/components/avans/filtre";
import { CustomDataTable } from "@/components/custom-data-table";
import { Badge } from "@/components/ui/badge";
import type { AvansTalepKaydi } from "@/types/avans";
import { User } from "@/types/auth";
import { formatMoney } from "@/lib/format-helpers";

type AvansTalepListesiProps = {
  isYoneticiVeyaAdmin: boolean;
  user: User | null;
};

export default function AvansTalepListesi({
  isYoneticiVeyaAdmin,
  user,
}: AvansTalepListesiProps) {
  const defaults = useMemo(getDefaultIzinTarihAraligi, []);
  const [baslangic, setBaslangic] = useState<string>(defaults.BaslangicTarihi);
  const [bitis, setBitis] = useState<string>(defaults.BitisTarihi);
  const [filterOpen, setFilterOpen] = useState(false);
  const [redItem, setRedItem] = useState<AvansTalepKaydi | null>(null);

  const filtre = {
    IDSube: user?.IDSube ?? "0",
    IDSubePersonel: isYoneticiVeyaAdmin ? "0" : (user?.IDSubePersonel ?? "0"),
    BaslangicTarihi: baslangic,
    BitisTarihi: bitis,
  };
  const { data, isLoading, isRefetching, refetch } = useAvansTalepleri(filtre);

  const updateTalepMutation = useUpdateAvansTalep();

  const handleOnayla = async (item: AvansTalepKaydi) => {
    const ok = await confirm({
      title: "Talebi onayla",
      description: `${item.Ad} ${item.Soyad} - ${item.Tutar} TL tutarındaki avans talebi onaylansın mı?`,
      confirmText: "Onayla",
    });
    if (ok) {
      updateTalepMutation.mutate({
        IDSubePersonelAvansTalep: item.IDSubePersonelAvansTalep,
        IDKullanici: user?.IDKullanici ?? "0",
        KabulRed: "1",
        RedAciklama: "",
      });
    }
  };

  const handleReddetGonder = (aciklama: string) => {
    if (!redItem) return;
    updateTalepMutation.mutate({
      IDSubePersonelAvansTalep: redItem.IDSubePersonelAvansTalep,
      IDKullanici: user?.IDKullanici ?? "0",
      KabulRed: "0",
      RedAciklama: aciklama,
    });
    setRedItem(null);
  };

  const renderDurum = (item: AvansTalepKaydi) => {
    if (item.KabulRed === 1) {
      return (
        <Badge variant="success">
          <Text className="text-xs text-white">Onaylandı</Text>
        </Badge>
      );
    }
    if (item.KabulRed === 0) {
      return (
        <Badge variant="destructive">
          <Text className="text-xs text-white">Reddedildi</Text>
        </Badge>
      );
    }
    return (
      <Badge variant="warning">
        <Text className="text-xs text-white">Bekliyor</Text>
      </Badge>
    );
  };

  const personelColumns = [
    {
      key: "tarih",
      label: "Tarih",
      flex: 2,
      render: (item: AvansTalepKaydi) => (
        <Text className="text-xs text-gray-700">
          {format(new Date(item.OdemeBaslangicTarihi), "dd.MM.yyyy")}
        </Text>
      ),
    },
    {
      key: "tutar",
      label: "Tutar",
      flex: 1,
      render: (item: AvansTalepKaydi) => (
        <Text className="text-xs text-gray-700">{formatMoney(item.Tutar) } ₺</Text>
      ),
    },
    {
      key: "durum",
      label: "Durum",
      flex: 1,
      render: renderDurum,
    },
  ];

  const yoneticiColumns = [
    {
      key: "ad",
      label: "Personel",
      flex: 2,
      render: (item: AvansTalepKaydi) => (
        <Text className="text-xs text-gray-700" numberOfLines={1}>
          {item.Ad} {item.Soyad}
        </Text>
      ),
    },
    {
      key: "tutar",
      label: "Tutar",
      flex: 1,
      render: (item: AvansTalepKaydi) => (
        <Text className="text-xs text-gray-700">{formatMoney(item.Tutar) } ₺</Text>
      ),
    },
    {
      key: "durum",
      label: "Durum",
      flex: 1,
      render: renderDurum,
    },
  ];

  const columns = isYoneticiVeyaAdmin ? yoneticiColumns : personelColumns;

  const renderDetail = (item: AvansTalepKaydi) => (
    <View className="gap-1">
      <Text className="text-xs text-gray-600">
        Bölüm: <Text className="text-gray-800">{item.BolumAdi}</Text>
      </Text>
      <Text className="text-xs text-gray-600">
        Ad Soyad:{" "}
        <Text className="text-gray-800">
          {item.Ad} {item.Soyad}
        </Text>
      </Text>
      <Text className="text-xs text-gray-600">
        Sicil No: <Text className="text-gray-800">{item.SicilNo}</Text>
      </Text>
      <Text className="text-xs text-gray-600">
        Taksit Sayısı:{" "}
        <Text className="text-gray-800">{item.TaksitSayisi}</Text>
      </Text>
      <Text className="text-xs text-gray-600">
        Bordro Kesinti Tutarı:{" "}
        <Text className="text-gray-800">{item.BordroKesintiTutari} TL</Text>
      </Text>
      <Text className="text-xs text-gray-600">
        Mesaj: <Text className="text-gray-800">{item.Mesaj}</Text>
      </Text>
      {item.KabulRed === 0 && item.RedAciklama ? (
        <Text className="text-xs text-red-600">
          Ret Açıklaması: {item.RedAciklama}
        </Text>
      ) : null}
    </View>
  );

  const filtreOzet = `${format(new Date(baslangic), "d MMM", { locale: tr })} - ${format(new Date(bitis), "d MMM yyyy", { locale: tr })}`;

  return (
    <View className="flex-1">
      <Pressable
        onPress={() => setFilterOpen(true)}
        className="mt-3 flex-row items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
      >
        <Text className="text-xs text-gray-600">{filtreOzet}</Text>
        <SlidersHorizontal size={16} color="#0f172a" />
      </Pressable>

      <View className="mt-4 flex-1">
        {isLoading ? (
          <ActivityIndicator className="mt-8" />
        ) : (
          <CustomDataTable
            columns={columns}
            data={data ?? []}
            keyExtractor={(item: AvansTalepKaydi) =>
              item.IDSubePersonelAvansTalep
            }
            renderAction={(item: AvansTalepKaydi) =>
              isYoneticiVeyaAdmin && item.KabulRed === null ? (
                <View className="flex-row gap-3">
                  <Pressable onPress={() => handleOnayla(item)} hitSlop={10}>
                    <Check size={18} color="#16a34a" />
                  </Pressable>
                  <Pressable onPress={() => setRedItem(item)} hitSlop={10}>
                    <X size={18} color="#dc2626" />
                  </Pressable>
                </View>
              ) : null
            }
            renderDetail={renderDetail}
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        )}
      </View>

      <AvansFilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        baslangic={baslangic}
        bitis={bitis}
        onBaslangicChange={setBaslangic}
        onBitisChange={setBitis}
        onTemizle={() => {
          setBaslangic(defaults.BaslangicTarihi);
          setBitis(defaults.BitisTarihi);
        }}
      />

      <RedAciklamaModal
        visible={redItem !== null}
        personelAdi={redItem ? `${redItem.Ad} ${redItem.Soyad}` : ""}
        onClose={() => setRedItem(null)}
        onSubmit={handleReddetGonder}
      />
    </View>
  );
}