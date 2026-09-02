import { USER_TYPES, type UserType } from "@/lib/user-types";
import { useAuthStore } from "@/stores/auth-store";

export function useRole() {
  const idKullaniciTip = useAuthStore((state) => state.user?.IDKullaniciTip);

  return {
    idKullaniciTip,
    isAdmin: idKullaniciTip === USER_TYPES.ADMIN,
    isYonetici: idKullaniciTip === USER_TYPES.YONETICI,
    isPersonel: idKullaniciTip === USER_TYPES.PERSONEL,
    /** Verilen rol listesinden herhangi birine sahip mi? */
    hasRole: (allowed: readonly UserType[]) =>
      !!idKullaniciTip && allowed.includes(idKullaniciTip as UserType),
  };
}