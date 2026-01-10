import { useMemo } from "react";
import {
  canAccessNav as canAccessNavUtil,
  canEdit as canEditModule,
  canManagePolicy as canManagePolicyUtil,
  canSeeReports,
  canView as canViewModule,
  getReportScope as getReportScopeUtil,
  getRoleContext,
  getRoleName,
  isReadOnlyRole,
} from "./rbacUtils";

const ROLE_LABELS = {
  AppAdmin: "App Admin",
  HQ: "HQ",
  OrgAdmin: "Org Admin",
  OrgExecutive: "Org Executive",
  OrgCaseworker: "Caseworker",
  ImamUser: "Imam User",
};

export const useRole = () => {
  const context = useMemo(() => getRoleContext(), []);
  const { roleKey, roleId, username, user } = context || {};

  const helpers = useMemo(() => {
    const numericRole = roleId ?? null;
    const safeRoleKey = roleKey || null;
    const safeUser = user || {};
    const hasRole = (roles) => {
      if (!numericRole) return false;
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(numericRole);
    };

    return {
      userType: numericRole,
      username: username || null,
      user: safeUser,
      roleKey: safeRoleKey,
      roleName: safeRoleKey ? (ROLE_LABELS[safeRoleKey] || getRoleName(safeRoleKey)) : "Guest",
      isAppAdmin: safeRoleKey === "AppAdmin",
      isHQ: safeRoleKey === "HQ",
      isOrgAdmin: safeRoleKey === "OrgAdmin",
      isOrgExecutive: safeRoleKey === "OrgExecutive",
      isCaseworker: safeRoleKey === "OrgCaseworker",
      isImamUser: safeRoleKey === "ImamUser",
      isGlobalAdmin: ["AppAdmin", "HQ"].includes(safeRoleKey),
      centerId: null, // center_id has been removed
      hasRole,
      isAdmin: () => ["AppAdmin", "HQ", "OrgAdmin"].includes(safeRoleKey),
      canManageEmployees: () => ["AppAdmin", "HQ", "OrgAdmin"].includes(safeRoleKey),
      canWrite: () => !isReadOnlyRole(safeRoleKey),
      canAccessModule: (module) => canViewModule(module, safeRoleKey),
      canEditModule: (module) => canEditModule(module, safeRoleKey),
      canAccessNav: (navItem) => canAccessNavUtil(navItem, safeRoleKey),
      canManagePolicy: () => canManagePolicyUtil(safeRoleKey),
      canViewReports: () => canSeeReports(safeRoleKey),
      getRoleName: () => safeRoleKey ? (ROLE_LABELS[safeRoleKey] || getRoleName(safeRoleKey)) : "Guest",
      getReportScope: () => getReportScopeUtil(safeRoleKey),
      isReadOnly: isReadOnlyRole(safeRoleKey),
    };
  }, [roleId, username, user, roleKey]);

  return helpers;
};

export const getCurrentUserRole = () => {
  const roleContext = getRoleContext();
  return roleContext.roleId ?? null;
};

export const hasRole = (roles) => {
  const currentRole = getCurrentUserRole();
  if (!currentRole) return false;
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(currentRole);
};

// center_id has been removed - this function is deprecated
export const getCurrentCenterId = () => {
  return null;
};

