import { USER_TYPES, type UserType } from "@/lib/user-types";
import { useAuthStore } from "@/stores/auth-store";
import { useCallback } from "react";

export function useRole() {
  const idKullaniciTip = useAuthStore((state) => state.user?.IDKullaniciTip);

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
