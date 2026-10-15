import { USER_TYPES, type UserType } from "@/lib/user-types";
import { useAuthStore } from "@/stores/auth-store";
import { useCallback } from "react";

export function useRole() {
  // Login API'si DB satırını olduğu gibi döndüğü için IDKullaniciTip number
  // (3) gelebiliyor; USER_TYPES string ("3") olduğundan karşılaştırma için
  // string'e çeviriyoruz.
  const rawTip = useAuthStore((state) => state.user?.IDKullaniciTip);
  const idKullaniciTip =
    rawTip === null || rawTip === undefined
      ? undefined
      : (String(rawTip) as UserType);

  const hasRole = useCallback(
    (allowed: readonly UserType[]) =>
      !!idKullaniciTip && allowed.includes(idKullaniciTip as UserType),
    [idKullaniciTip],
  );

  return {
    idKullaniciTip,
    isAdmin: idKullaniciTip === USER_TYPES.ADMIN,
    isYonetici: idKullaniciTip === USER_TYPES.YONETICI,
    isPersonel: idKullaniciTip === USER_TYPES.PERSONEL,
    /** Verilen rol listesinden herhangi birine sahip mi? */
    hasRole,
  };
}
