export const USER_TYPES = {
  ADMIN: "1",
  YONETICI: "2",
  PERSONEL: "3",
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];
