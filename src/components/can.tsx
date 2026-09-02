// components/can.tsx
import { type UserType } from "@/lib/user-types";
import { useRole } from "@/hooks/use-role";
import { ReactNode } from "react";

type CanProps = {
  roles: readonly UserType[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function Can({ roles, children, fallback = null }: CanProps) {
  const { hasRole } = useRole();
  return hasRole(roles) ? <>{children}</> : <>{fallback}</>;
}