"use client";

import {UserRole} from "@prisma/client";
import { useCurrentRole } from "@/hooks/use-current-role";
import { FormError } from "@/components/form-error";


interface RoleGateProps {
  children: React.ReactNode;
  allowedRole: UserRole;
};


export const RoleGate = ({ children, allowedRole }: RoleGateProps) => {
  const role = useCurrentRole();

  //💡 allowedRole is set to ADMIN 🙋‍♂️ in
  // 📂@app/(protected)/admin/page.tsx
  if (role !== allowedRole) {
    return (
      <FormError message="You do not have permission to view this content!" />
    )
  }

  return (
    <>
      {children}
    </>
  );
};
