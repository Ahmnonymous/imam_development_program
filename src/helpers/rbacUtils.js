const STORAGE_KEYS = ["IDPUser", "authUser", "currentUser", "user"];

const ROLE_IDS = {
  AppAdmin: 1,
  HQ: 2,
  OrgAdmin: 3,
  OrgExecutive: 4,
  OrgCaseworker: 5,
  ImamUser: 6,
};

const ROLE_BY_ID = Object.entries(ROLE_IDS).reduce((acc, [key, id]) => {
  acc[id] = key;
  return acc;
}, {});

const MODULE_ALIASES = {
  dashboard: "dashboard",
  "dashboard-main": "dashboard",
  // tasks, comments, relationships, home-visit, financial-assistance, food-assistance, attachments removed (had File_ID)
  programs: "programs",
  "financial-assessment": "financialAssessment",
  employees: "employee",
  employee: "employee",
  training: "training",
  "training-courses": "training",
  lookup: "lookup",
  lookups: "lookup",
  reports: "reports",
  report: "reports",
  policy: "policy",
  "policy-library": "policy",
  "policy-and-procedure": "policy",
  "policy_and_procedure": "policy",
  "file-manager": "fileManager",
  filemanager: "fileManager",
  folders: "fileManager",
  chat: "chat",
  hadith: "lookup",
};

const normalizeModule = (module) => {
  if (!module) return "";
  const key = module.toString().trim().toLowerCase();
  if (MODULE_ALIASES[key]) return MODULE_ALIASES[key];
  return key;
};

const NAV_ITEM_TO_MODULE = {
  dashboard: "dashboard",
  reports: "reports",
  lookups: "lookup",
  filemanager: "fileManager",
  chat: "chat",
  policy: "policy",
  "policy-library": "policy",
};

const createSet = (items = []) => new Set(items.map((item) => normalizeModule(item)));

const ROLE_RULES = {
  AppAdmin: {
    id: ROLE_IDS.AppAdmin,
    reportScope: "all",
    modules: {
      view: "all",
      edit: "all",
      denyView: createSet(),
      denyEdit: createSet(),
    },
    navHide: createSet(),
    readOnly: false,
  },
  HQ: {
    id: ROLE_IDS.HQ,
    reportScope: "all",
    modules: {
      view: "all",
      edit: "all",
      denyView: createSet([]),
      denyEdit: createSet([]),
    },
    navHide: createSet([]),
    readOnly: false,
  },
  OrgAdmin: {
    id: ROLE_IDS.OrgAdmin,
    reportScope: "own",
    modules: {
      view: "all",
      edit: "all",
      denyView: createSet([]),
      denyEdit: createSet(["policy"]),
    },
    navHide: createSet([]),
    readOnly: false,
  },
  OrgExecutive: {
    id: ROLE_IDS.OrgExecutive,
    reportScope: "own",
    modules: {
      view: "all",
      edit: "none",
      denyView: createSet(["filemanager", "chat", "lookup"]),
      denyEdit: createSet(["filemanager", "chat", "lookup"]),
    },
    navHide: createSet(["filemanager", "chat", "lookup"]),
    readOnly: true,
  },
  OrgCaseworker: {
    id: ROLE_IDS.OrgCaseworker,
    reportScope: "own",
    modules: {
      view: createSet([
        "dashboard",
        // tasks, comments, relationships, homevisits, financialassistance, foodassistance, attachments removed (had File_ID)
        "programs",
        "filemanager",
        "chat",
        "policy",
        "reports",
        "training",
        "employee",
        "lookup",
      ]),
      edit: createSet([
        // tasks, comments, relationships, homevisits, financialassistance, foodassistance, attachments removed (had File_ID)
        "programs",
      ]),
      denyView: createSet([]),
      denyEdit: createSet(["policy", "reports", "lookup", "employee"]),
    },
    navHide: createSet(["lookup", "employee"]),
    readOnly: false,
  },
  ImamUser: {
    id: ROLE_IDS.ImamUser,
    reportScope: "own",
    modules: {
      view: createSet(["dashboard", "imam-profiles"]),
      edit: createSet(["imam-profiles"]),
      denyView: createSet(["tasks", "comments", "relationships", "homevisits", "financialassistance", "foodassistance", "attachments", "programs", "filemanager", "chat", "policy", "reports", "training", "employee", "lookup"]),
      denyEdit: createSet(["tasks", "comments", "relationships", "homevisits", "financialassistance", "foodassistance", "attachments", "programs", "filemanager", "chat", "policy", "reports", "training", "employee", "lookup"]),
    },
    navHide: createSet(["tasks", "comments", "relationships", "homevisits", "financialassistance", "foodassistance", "attachments", "programs", "filemanager", "chat", "policy", "reports", "training", "employee", "lookup"]),
    readOnly: false,
  },
};

const resolveRoleKey = (roleInput) => {
  if (!roleInput && roleInput !== 0) return null;

  if (typeof roleInput === "string") {
    if (ROLE_RULES[roleInput]) return roleInput;
    const normalized = roleInput.trim();
    if (ROLE_RULES[normalized]) return normalized;
    const numeric = parseInt(roleInput, 10);
    if (!Number.isNaN(numeric)) return ROLE_BY_ID[numeric] || null;
  }

  const numeric = parseInt(roleInput, 10);
  if (!Number.isNaN(numeric)) return ROLE_BY_ID[numeric] || null;

  return null;
};

const resolveRoleFromUser = (user = {}) => {
  const potential = [
    user.roleKey,
    user.role,
    user.role_id,
    user.roleId,
    user.user_type,
    user.userType,
  ];

  for (const value of potential) {
    const roleKey = resolveRoleKey(value);
    if (roleKey) return roleKey;
  }

  return null;
};

export const getStoredUser = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  for (const key of STORAGE_KEYS) {
    const value = window.localStorage.getItem(key);
    if (!value) continue;
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch (err) {
      console.warn("rbacUtils:getStoredUser parse error", err);
    }
  }
  return null;
};

export const getRoleContext = () => {
  const stored = getStoredUser() || {};
  const roleKey = resolveRoleFromUser(stored);
  const roleId = roleKey ? ROLE_RULES[roleKey]?.id || null : null;
  const username = stored.username || stored.name || stored.email || null;

  return {
    user: stored || {},
    roleKey: roleKey || null,
    roleId: roleId || null,
    username: username || null,
    isAuthenticated: Boolean(roleKey),
  };
};

const getRoleRule = (roleInput) => {
  const roleKey = resolveRoleKey(roleInput);
  return roleKey ? ROLE_RULES[roleKey] : null;
};

const isDenied = (setOrFlag, moduleKey) => {
  if (!setOrFlag) return false;
  if (setOrFlag === "none") return true;
  if (setOrFlag === "all") return true;
  if (setOrFlag instanceof Set) return setOrFlag.has(moduleKey);
  return false;
};

const hasAccess = (rules, moduleKey, type) => {
  if (!rules) return false;
  const denySet = type === "edit" ? rules.denyEdit : rules.denyView;
  if (denySet && denySet.has(moduleKey)) return false;

  const scope = rules[type];
  if (!scope) return false;
  if (scope === "all") return true;
  if (scope === "none") return false;
  if (scope instanceof Set) return scope.has(moduleKey);
  return false;
};

export const canView = (module, roleOrUser) => {
  const moduleKey = normalizeModule(module);
  const roleRules = getRoleRule(
    typeof roleOrUser === "object" ? resolveRoleFromUser(roleOrUser) : roleOrUser,
  );
  if (!roleRules) return false;
  if (roleRules.modules.denyView.has(moduleKey)) return false;
  return hasAccess(roleRules.modules, moduleKey, "view");
};

export const canEdit = (module, roleOrUser) => {
  const moduleKey = normalizeModule(module);
  const roleRules = getRoleRule(
    typeof roleOrUser === "object" ? resolveRoleFromUser(roleOrUser) : roleOrUser,
  );
  if (!roleRules) return false;
  if (roleRules.readOnly) return false;
  if (roleRules.modules.denyEdit.has(moduleKey)) return false;
  return hasAccess(roleRules.modules, moduleKey, "edit");
};

export const canAccessNav = (navItem, roleOrUser) => {
  const moduleKey = NAV_ITEM_TO_MODULE[normalizeModule(navItem)] || normalizeModule(navItem);
  const roleKey = typeof roleOrUser === "object"
    ? resolveRoleFromUser(roleOrUser)
    : resolveRoleKey(roleOrUser);

  const roleRules = roleKey ? ROLE_RULES[roleKey] : null;
  if (!roleRules) return false;
  if (roleRules.navHide.has(moduleKey)) return false;
  return canView(moduleKey, roleKey);
};

export const getReportScope = (roleOrUser) => {
  const roleKey = typeof roleOrUser === "object"
    ? resolveRoleFromUser(roleOrUser)
    : resolveRoleKey(roleOrUser);
  return roleKey ? ROLE_RULES[roleKey]?.reportScope || "own" : "own";
};

export const isReadOnlyRole = (roleOrUser) => {
  const roleRules = getRoleRule(
    typeof roleOrUser === "object" ? resolveRoleFromUser(roleOrUser) : roleOrUser,
  );
  return roleRules?.readOnly || false;
};


export const canSeeReports = (roleOrUser) => canView("reports", roleOrUser);

export const canManagePolicy = (roleOrUser) => canEdit("policy", roleOrUser);

export const getRoleName = (roleOrUser) => {
  const roleKey = typeof roleOrUser === "object"
    ? resolveRoleFromUser(roleOrUser)
    : resolveRoleKey(roleOrUser);
  return roleKey || "Guest";
};

