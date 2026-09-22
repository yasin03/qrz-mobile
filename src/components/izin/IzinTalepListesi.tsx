import { useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { SlidersHorizontal, Check, X as XIcon } from "lucide-react-native";

import { getDefaultIzinTarihAraligi } from "@/lib/date-helpers";
import { User } from "@/types/auth";
import { IzinTalepType } from "@/types/izin";
import { useRole } from "@/hooks/use-role";
import { ROLE_GROUPS } from "@/lib/user-types";
import { Can } from "@/components/can";
import { useTalepList, useUpdateTalep } from "@/hooks/use-izin";
import { CustomDataTable } from "../custom-data-table";
import { IzinTalepFiltreSheet } from "./izin-talep-filtre";
import { RedAciklamaModal } from "./red-aciklama-modal";
import { confirm } from "@/stores/dialog-store";
import { Badge } from "../ui/badge";

type IzinTalepListesiProps = {
  user: User | null;
};

export default function IzinTalepListesi({ user }: IzinTalepListesiProps) {
  const { isAdmin, isYonetici } = useRole();
  const isYoneticiVeyaAdmin = isAdmin || isYonetici;

  const defaults = useMemo(getDefaultIzinTarihAraligi, []);
  const [baslangic, setBaslangic] = useState(defaults.BaslangicTarihi);
  const [bitis, setBitis] = useState(defaults.BitisTarihi);
  const [filterOpen, setFilterOpen] = useState(false);
  const [redTarget, setRedTarget] = useState<IzinTalepType | null>(null);

  const filtre = {
    IDSube: user?.IDSube ?? "0",
    IDSubePersonel: isYoneticiVeyaAdmin ? "0" : (user?.IDSubePersonel ?? "0"),
    BaslangicTarihi: baslangic,
    BitisTarihi: bitis,
  };

  const { data, isLoading, isRefetching, refetch } = useTalepList(filtre);
  const updateTalepMutation = useUpdateTalep();

  const handleTemizle = () => {
    setBaslangic(defaults.BaslangicTarihi);
    setBitis(defaults.BitisTarihi);
  };

  const handleOnayla = async (item: IzinTalepType) => {
    const ok = await confirm({
      title: "Talebi onayla",
      description: `${item.Ad} ${item.Soyad} - ${format(new Date(item.BaslangicTarihi), "dd.MM.yyyy")} tarihli izin talebi onaylansın mı?`,
      confirmText: "Onayla",
    });
    if (!ok || !user?.IDKullanici) return;
    updateTalepMutation.mutate({
      IDSubePersonelIzinTalep: item.IDSubePersonelIzinTalep,
      IDKullanici: user.IDKullanici,
      KabulRed: "1",
      RedAciklama: "",
    });
  };

  const handleRedOnayla = (redAciklama: string) => {
    if (!redTarget || !user?.IDKullanici) return;
    updateTalepMutation.mutate(
      {
        IDSubePersonelIzinTalep: redTarget.IDSubePersonelIzinTalep,
        IDKullanici: user.IDKullanici,
        KabulRed: "2",
        RedAciklama: redAciklama,
      },
      { onSuccess: () => setRedTarget(null) },
    );
  };

  const renderDurum = (item: IzinTalepType) => {
    if (item.OnayDurum) {
      return (
        <Badge variant="success">
          <Text className="text-xs text-white">Onaylandı</Text>
        </Badge>
      );
    }
    if (item.RedDurum) {
      return (
        <Badge variant="destructive">
          <Text className="text-xs text-white">Reddedildi</Text>
        </Badge>
      );
    }
    return (
      <Badge variant="warning">
        <Text className="text-xs text-white">Beklemede</Text>
      </Badge>
    );
  };

  const isBeklemede = (item: IzinTalepType) =>
    !item.OnayDurum && !item.RedDurum;

  const personelColumns = [
    {
      key: "gun",
      label: "Gün",
      flex: 1,
      render: (item: IzinTalepType) => (
        <Text className="text-xs text-gray-700">{item.Gun}</Text>
      ),
    },
    {
      key: "aciklama",
      label: "İzin Tipi",
      flex: 1,
      render: (item: IzinTalepType) => (
        <Text className="text-xs text-gray-700" numberOfLines={1}>
          {item.Aciklama}
        </Text>
      ),
    },
    {
      key: "durum",
      label: "Durum",

      render: renderDurum,
    },
  ];

  const yoneticiColumns = [
    {
      key: "ad",
      label: "Personel",
      flex: 2,
      render: (item: IzinTalepType) => (
        <Text className="text-xs text-gray-700" numberOfLines={1}>
          {item.Ad} {item.Soyad}
        </Text>
      ),
    },
    {
      key: "tarih",
      label: "Tarih",
      flex: 2,
      render: (item: IzinTalepType) => (
        <Text className="text-xs text-gray-700">
          {format(new Date(item.BaslangicTarihi), "dd.MM")} -{" "}
          {format(new Date(item.BitisTarihi), "dd.MM.yyyy")}
        </Text>
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

  const renderDetail = (item: IzinTalepType) => (
    <View className="gap-2">
      <View className="gap-1">
        {isYoneticiVeyaAdmin && (
          <Text className="text-xs text-gray-600">
            Sicil No: <Text className="text-gray-800">{item.SicilNo}</Text>
          </Text>
        )}
        <Text className="text-xs text-gray-600">
          İzin Tipi: <Text className="text-gray-800">{item.Aciklama}</Text>
        </Text>
        <Text className="text-xs text-gray-600">
          Başlangıç Tarihi : {" "}
          <Text className="text-gray-800">
            {format(new Date(item.BaslangicTarihi), "dd.MM.yyyy")}
          </Text>
        </Text>
        <Text className="text-xs text-gray-600">
          Bitiş Tarihi : {" "}
          <Text className="text-gray-800">
            {format(new Date(item.BitisTarihi), "dd.MM.yyyy")}
          </Text>
        </Text>
        <Text className="text-xs text-gray-600">
          Adres: <Text className="text-gray-800">{item.Adres}</Text>
        </Text>
        {!!item.Telefon && (
          <Text className="text-xs text-gray-600">
            Telefon: <Text className="text-gray-800">{item.Telefon}</Text>
          </Text>
        )}
        {!!item.Mesaj && (
          <Text className="text-xs text-gray-600">
            Mesaj: <Text className="text-gray-800">{item.Mesaj}</Text>
          </Text>
        )}
        {!!item.RedAciklama && (
          <Text className="text-xs text-gray-600">
            Red Gerekçesi:{" "}
            <Text className="text-red-600">{item.RedAciklama}</Text>
          </Text>
        )}
      </View>

      <Can roles={ROLE_GROUPS.ADMIN_VE_YONETICI}>
        {isBeklemede(item) && (
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => handleOnayla(item)}
              className="flex-1 flex-row items-center justify-center gap-1 rounded-lg bg-green-600 py-2"
            >
              <Check size={14} color="white" />
              <Text className="text-xs font-medium text-white">Onayla</Text>
            </Pressable>
            <Pressable
              onPress={() => setRedTarget(item)}
              className="flex-1 flex-row items-center justify-center gap-1 rounded-lg bg-red-600 py-2"
            >
              <XIcon size={14} color="white" />
              <Text className="text-xs font-medium text-white">Reddet</Text>
            </Pressable>
          </View>
        )}
      </Can>
    </View>
  );

  const filtreOzet = `${format(new Date(baslangic), "d MMM", { locale: tr })} - ${format(new Date(bitis), "d MMM yyyy", { locale: tr })}`;

  return (
    <View className="flex-1">
      <Pressable
        onPress={() => setFilterOpen(true)}
        className="flex-row items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
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
            keyExtractor={(item) => item.IDSubePersonelIzinTalep}
            renderDetail={renderDetail}
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        )}
      </View>

      <IzinTalepFiltreSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        baslangic={baslangic}
        bitis={bitis}
        onBaslangicChange={setBaslangic}
        onBitisChange={setBitis}
        onTemizle={handleTemizle}
      />

      <RedAciklamaModal
        visible={!!redTarget}
        onClose={() => setRedTarget(null)}
        onConfirm={handleRedOnayla}
        isSubmitting={updateTalepMutation.isPending}
      />
    </View>
  );
}
