import { useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Plus, Trash2, SlidersHorizontal, Check, X } from "lucide-react-native";
import { format } from "date-fns";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthStore } from "@/stores/auth-store";
import { useRole } from "@/hooks/use-role";
import {
  useAvanslar,
  useDeleteAvans,
  useAvansTalepleri,
  useUpdateAvansTalep,
} from "@/hooks/use-avans";
import { getDefaultIzinTarihAraligi } from "@/lib/date-helpers";
import { confirm } from "@/stores/dialog-store";
import { RedAciklamaModal } from "@/components/avans/red-aciklama-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvansFilterSheet } from "@/components/avans/filtre";
import { CustomDataTable } from "@/components/custom-data-table";
import type { AvansKaydi, AvansTalepKaydi } from "@/types/avans";
import { User } from "@/types/auth";

type AvansTalepListesiProps = {
  isYoneticiVeyaAdmin: boolean;
  user: User | null;
};

function AvansTalepListesi({
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
  const { data, isLoading } = useAvansTalepleri(filtre);
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
        <Text className="text-xs text-gray-700">{item.Tutar} TL</Text>
      ),
    },
    {
      key: "durum",
      label: "Durum",
      flex: 1,
      render: (item: AvansTalepKaydi) => (
        <Text
          className={
            item.KabulRed === 1
              ? "text-xs text-green-600"
              : item.KabulRed === 0
                ? "text-xs text-red-600"
                : "text-xs text-amber-600"
          }
        >
          {item.KabulRed === 1
            ? "Onaylandı"
            : item.KabulRed === 0
              ? "Reddedildi"
              : "Bekliyor"}
        </Text>
      ),
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
        <Text className="text-xs text-gray-700">{item.Tutar} TL</Text>
      ),
    },
    {
      key: "durum",
      label: "Durum",
      flex: 1,
      render: (item: AvansTalepKaydi) => (
        <Text
          className={
            item.KabulRed === 1
              ? "text-xs text-green-600"
              : item.KabulRed === 0
                ? "text-xs text-red-600"
                : "text-xs text-amber-600"
          }
        >
          {item.KabulRed === 1
            ? "Onaylandı"
            : item.KabulRed === 0
              ? "Reddedildi"
              : "Bekliyor"}
        </Text>
      ),
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

  const filtreOzet = `${format(new Date(baslangic), "d MMM")} - ${format(new Date(bitis), "d MMM yyyy")}`;

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

type AvansListesiProps = {
  user: User | null;
};

function AvansListesi({ user }: AvansListesiProps) {
  const defaults = useMemo(getDefaultIzinTarihAraligi, []);
  const [baslangic, setBaslangic] = useState<string>(defaults.BaslangicTarihi);
  const [bitis, setBitis] = useState<string>(defaults.BitisTarihi);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtre = {
    IDSube: user?.IDSube ?? "0",
    BaslangicTarihi: baslangic,
    BitisTarihi: bitis,
  };

  const { data, isLoading } = useAvanslar(filtre);
  const deleteAvansMutation = useDeleteAvans();

  const handleDelete = async (item: AvansKaydi) => {
    const ok = await confirm({
      title: "Avansı sil",
      description: `${item.Ad} ${item.Soyad} - ${item.Tutar} TL tutarındaki avans silinsin mi?`,
      variant: "destructive",
      confirmText: "Sil",
    });
    if (ok) deleteAvansMutation.mutate(item.IDIzinGenel);
  };

  const columns = [
    {
      key: "ad",
      label: "Personel",
      flex: 2,
      render: (item: AvansKaydi) => (
        <Text className="text-xs text-gray-700" numberOfLines={1}>
          {item.Ad} {item.Soyad}
        </Text>
      ),
    },
    {
      key: "tutar",
      label: "Tutar",
      flex: 1,
      render: (item: AvansKaydi) => (
        <Text className="text-xs text-gray-700">{item.Tutar} TL</Text>
      ),
    },
    {
      key: "tarih",
      label: "Ödeme",
      flex: 1,
      render: (item: AvansKaydi) => (
        <Text className="text-xs text-gray-700">
          {format(new Date(item.OdemeBaslangicTarihi), "dd.MM.yyyy")}
        </Text>
      ),
    },
  ];

  const renderDetail = (item: AvansKaydi) => (
    <View className="gap-1">
      <Text className="text-xs text-gray-600">
        Bölüm: <Text className="text-gray-800">{item.BolumAdi}</Text>
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
    </View>
  );

  const filtreOzet = `${format(new Date(baslangic), "d MMM")} - ${format(new Date(bitis), "d MMM yyyy")}`;

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
            keyExtractor={(item: AvansKaydi) => item.IDIzinGenel}
            renderAction={(item: AvansKaydi) => (
              <Pressable onPress={() => handleDelete(item)} hitSlop={10}>
                <Trash2 size={18} color="#dc2626" />
              </Pressable>
            )}
            renderDetail={renderDetail}
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
    </View>
  );
}

export default function Avans() {
  const { isPersonel, isAdmin, isYonetici } = useRole();
  const isYoneticiVeyaAdmin = isAdmin || isYonetici;
  const user = useAuthStore((state) => state.user);
  const [tabValue, setTabValue] = useState("talep");

  return (
    <SafeAreaView className="flex-1 bg-white px-4 pt-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-medium text-qrz-navy">Avanslar</Text>
        {isPersonel ? (
          <Pressable
            onPress={() => router.push("/avanslar/ekle")}
            className="flex-row items-center gap-1 rounded-lg bg-qrz-navy px-3 py-2"
          >
            <Plus size={16} color="white" />
            <Text className="text-xs font-medium text-white">Yeni Talep</Text>
          </Pressable>
        ) : null}
      </View>

      <Tabs
        value={tabValue}
        onValueChange={setTabValue}
        className="mt-3 flex-1"
      >
        <TabsList className="w-full flex-row">
          <TabsTrigger value="talep" className="flex-1 items-center">
            <Text>Talepler</Text>
          </TabsTrigger>
          <TabsTrigger value="avans" className="flex-1 items-center">
            <Text>Avanslar</Text>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="talep" className="flex-1">
          <AvansTalepListesi
            isYoneticiVeyaAdmin={isYoneticiVeyaAdmin}
            user={user}
          />
        </TabsContent>

        <TabsContent value="avans" className="flex-1">
          <AvansListesi user={user} />
        </TabsContent>
      </Tabs>
    </SafeAreaView>
  );
}
