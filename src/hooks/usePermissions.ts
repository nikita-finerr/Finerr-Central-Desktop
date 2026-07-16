import { useMemo } from "react";
import { useSelector } from "react-redux";

import { Permission } from "../constants/permissions";
import type { RootState } from "../redux/store";
import { hasPermission } from "../utils/permissions";

export const usePermissions = () => {
  const permissions = useSelector(
    (state: RootState) => state.auth.userData?.permissions,
  );

  return useMemo(
    () => ({
      permissions: permissions ?? [],
      canViewMessages: hasPermission(permissions, Permission.ViewMessage),
      canManageMessages: hasPermission(permissions, Permission.ManageMessage),
      canViewCalls: hasPermission(permissions, Permission.ViewCall),
      canManageCalls: hasPermission(permissions, Permission.ManageCall),
      canManageContacts: hasPermission(permissions, Permission.ManageContact),
      canViewFax: hasPermission(permissions, Permission.ViewFax),
      canManageFax: hasPermission(permissions, Permission.ManageFax),
      canViewVoicemail: hasPermission(permissions, Permission.ViewVoicemail),
      canManageVoicemail: hasPermission(
        permissions,
        Permission.ManageVoicemail,
      ),
      canViewTranscript: hasPermission(permissions, Permission.ViewTranscript),
    }),
    [permissions],
  );
};
