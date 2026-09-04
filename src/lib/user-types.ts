export const USER_TYPES = {
  ADMIN: "1",
  YONETICI: "2",
  PERSONEL: "3",
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];

export const ROLE_GROUPS = {
  ADMIN_VE_YONETICI: [USER_TYPES.ADMIN, USER_TYPES.YONETICI],
  ADMIN: [USER_TYPES.ADMIN],
  YONETICI: [USER_TYPES.YONETICI],
  PERSONEL : [USER_TYPES.PERSONEL],
} as const;
