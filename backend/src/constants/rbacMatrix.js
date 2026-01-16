/**
 * RBAC Matrix - Centralized Role-Based Access Control Definitions
 * Synced with Cursor RBAC ruleset.
 */

const METHODS = {
  READ_ONLY: ["GET", "HEAD", "OPTIONS"],
  FULL: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

const ROLES = {
  APP_ADMIN: 1,
  HQ: 2,
  ORG_ADMIN: 3,
  ORG_EXECUTIVE: 4,
  ORG_CASEWORKER: 5,
  IMAM_USER: 6,
};

const ROLE_KEY_BY_ID = {
  [ROLES.APP_ADMIN]: "AppAdmin",
  [ROLES.HQ]: "HQ",
  [ROLES.ORG_ADMIN]: "OrgAdmin",
  [ROLES.ORG_EXECUTIVE]: "OrgExecutive",
  [ROLES.ORG_CASEWORKER]: "OrgCaseworker",
  [ROLES.IMAM_USER]: "ImamUser",
};

const MODULES = {
  DEFAULT: "default",
  AUTH: "auth",
  DASHBOARD: "dashboard",
  // TASKS, COMMENTS, RELATIONSHIPS, HOME_VISITS, FINANCIAL_ASSISTANCE, FOOD_ASSISTANCE, ATTACHMENTS removed (had File_ID)
  PROGRAMS: "programs",
  FINANCIAL_ASSESSMENT: "financialAssessment",
  EMPLOYEE: "employee",
  TRAINING: "training",
  HSEQ: "hseq",
  POLICY: "policy",
  LOOKUP: "lookup",
  REPORTS: "reports",
  FILE_MANAGER: "fileManager",
  CHAT: "chat",
  PERSONAL_FILES: "personalFiles",
  IMAM_PROFILES: "imamProfiles",
};

const MODULE_ROUTE_MAP = [
  { module: MODULES.AUTH, prefixes: ["/api/auth"] },
  { module: MODULES.DASHBOARD, prefixes: ["/api/dashboard"] },
  // TASKS, COMMENTS, RELATIONSHIPS, HOME_VISITS, FINANCIAL_ASSISTANCE, FOOD_ASSISTANCE, ATTACHMENTS removed (had File_ID)
  { module: MODULES.PROGRAMS, prefixes: ["/api/programs"] },
  {
    module: MODULES.EMPLOYEE,
    prefixes: ["/api/employee", "/api/employeeappraisal", "/api/employeeinitiative", "/api/employeeskills"],
  },
  { module: MODULES.TRAINING, prefixes: ["/api/traininginstitutions", "/api/trainingcourses"] },
  { module: MODULES.POLICY, prefixes: ["/api/policyandprocedure"] },
  { module: MODULES.LOOKUP, prefixes: ["/api/lookup"] },
  { module: MODULES.REPORTS, prefixes: ["/api/reports"] },
  { module: MODULES.FILE_MANAGER, prefixes: ["/api/folders", "/api/personalfiles"] },
  { module: MODULES.PERSONAL_FILES, prefixes: ["/api/personalfiles"] },
  { module: MODULES.CHAT, prefixes: ["/api/messages", "/api/conversations", "/api/conversationparticipants"] },
  { 
    module: MODULES.IMAM_PROFILES, 
    prefixes: [
      "/api/imamprofiles",
      "/api/pearlsofwisdom",
      "/api/jumuahkhutbahtopic",
      "/api/medicalreimbursement",
      "/api/communityengagement",
      "/api/nikahbonus",
      "/api/jumuahaudiokhutbah",
      "/api/newmuslimbonus",
      "/api/newbabybonus",
      "/api/imamrelationships",
      "/api/borehole",
      "/api/imamfinancialassistance",
      "/api/educationaldevelopment",
      "/api/treeplanting",
      "/api/waqfloan",
      "/api/hardshiprelief",
      "/api/highereducationrequest",
      "/api/boreholeconstructiontasks",
      "/api/boreholerepairsmatrix",
      "/api/tickets"
    ] 
  },
];

const ROLE_RULES = {
  AppAdmin: {
    id: ROLES.APP_ADMIN,
    label: "App Admin",
    centerScoped: false,
    reportScope: "all",
    moduleAccess: {
      allow: "*",
      deny: [],
    },
    methodAccess: {
      default: METHODS.FULL,
      overrides: {},
    },
  },
  HQ: {
    id: ROLES.HQ,
    label: "HQ",
    centerScoped: false,
    reportScope: "all",
    moduleAccess: {
      allow: "*",
      deny: [],
    },
    methodAccess: {
      default: METHODS.FULL,
      overrides: {
      },
    },
  },
  OrgAdmin: {
    id: ROLES.ORG_ADMIN,
    label: "Org Admin",
    centerScoped: true,
    reportScope: "own",
    moduleAccess: {
      allow: "*",
      deny: [],
    },
    methodAccess: {
      default: METHODS.FULL,
      overrides: {
        [MODULES.POLICY]: METHODS.READ_ONLY,
      },
    },
  },
  OrgExecutive: {
    id: ROLES.ORG_EXECUTIVE,
    label: "Org Executive",
    centerScoped: true,
    reportScope: "own",
    moduleAccess: {
      allow: "*",
      deny: [
        MODULES.FILE_MANAGER,
        MODULES.PERSONAL_FILES,
        MODULES.CHAT,
      ],
    },
    methodAccess: {
      default: METHODS.READ_ONLY,
      overrides: {
        [MODULES.AUTH]: METHODS.FULL,
      },
    },
  },
  OrgCaseworker: {
    id: ROLES.ORG_CASEWORKER,
    label: "Org Caseworker",
    centerScoped: true,
    reportScope: "own",
    moduleAccess: {
      allow: [
        MODULES.DASHBOARD,
        // TASKS, COMMENTS, RELATIONSHIPS, HOME_VISITS, FINANCIAL_ASSISTANCE, FOOD_ASSISTANCE, ATTACHMENTS removed (had File_ID)
        MODULES.PROGRAMS,
        MODULES.FILE_MANAGER,
        MODULES.CHAT,
        MODULES.POLICY,
        MODULES.REPORTS,
        MODULES.PERSONAL_FILES,
      MODULES.TRAINING,
      MODULES.EMPLOYEE,
        MODULES.LOOKUP,
        MODULES.AUTH,
      ],
      deny: [],
    },
    methodAccess: {
      default: METHODS.FULL,
      overrides: {
        [MODULES.POLICY]: METHODS.READ_ONLY,
        [MODULES.REPORTS]: METHODS.READ_ONLY,
        [MODULES.LOOKUP]: METHODS.READ_ONLY,
      [MODULES.TRAINING]: METHODS.READ_ONLY,
      [MODULES.EMPLOYEE]: METHODS.READ_ONLY,
      },
    },
  },
  ImamUser: {
    id: ROLES.IMAM_USER,
    label: "Imam User",
    centerScoped: false,
    reportScope: "own",
    moduleAccess: {
      allow: [MODULES.DASHBOARD, MODULES.IMAM_PROFILES, MODULES.AUTH, MODULES.EMPLOYEE, MODULES.CHAT],
      deny: [
        // TASKS, COMMENTS, RELATIONSHIPS, HOME_VISITS, FINANCIAL_ASSISTANCE, FOOD_ASSISTANCE, ATTACHMENTS removed (had File_ID)
        MODULES.PROGRAMS,
        MODULES.FILE_MANAGER,
        MODULES.POLICY,
        MODULES.REPORTS,
        MODULES.PERSONAL_FILES,
        MODULES.TRAINING,
        MODULES.LOOKUP,
      ],
    },
    methodAccess: {
      default: METHODS.FULL,
      overrides: {
        [MODULES.IMAM_PROFILES]: METHODS.FULL,
        [MODULES.EMPLOYEE]: METHODS.READ_ONLY, // ImamUser can only read their own employee data
        // Note: CHAT module allows full access, but conversation creation is restricted in controller
      },
    },
  },
};

const normalizePath = (path = "") => path.toLowerCase();

const getModuleFromRoute = (routePath = "") => {
  const normalized = normalizePath(routePath);
  const entry =
    MODULE_ROUTE_MAP.find(({ prefixes }) =>
      prefixes.some((prefix) => normalized.startsWith(prefix))) || null;
  return entry ? entry.module : MODULES.DEFAULT;
};

const toRoleKey = (role) => {
  if (role === undefined || role === null) return null;
  if (typeof role === "string" && ROLE_RULES[role]) return role;
  const parsed = Number.parseInt(role, 10);
  return Number.isNaN(parsed) ? null : ROLE_KEY_BY_ID[parsed] || null;
};

const getRoleRule = (role) => {
  const roleKey = toRoleKey(role);
  return roleKey ? ROLE_RULES[roleKey] : null;
};

const isModuleAllowed = (role, moduleKey) => {
  const rule = getRoleRule(role);
  if (!rule) return false;

  const denySet = new Set(rule.moduleAccess?.deny || []);
  if (denySet.has(moduleKey)) return false;

  if (rule.moduleAccess?.allow === "*") return true;

  const allowList = new Set(rule.moduleAccess?.allow || []);
  return allowList.has(moduleKey);
};

const getAllowedMethods = (role, moduleKey) => {
  const rule = getRoleRule(role);
  if (!rule) return [];
  const overrides = rule.methodAccess?.overrides || {};
  return overrides[moduleKey] || rule.methodAccess?.default || [];
};

const normalizeMethod = (method = "GET") => method.toUpperCase();

const canAccessRoute = (role, routePath = "") => {
  const moduleKey = getModuleFromRoute(routePath);
  // Always allow lookups
  if (moduleKey === MODULES.LOOKUP) {
    return true;
  }
  return isModuleAllowed(role, moduleKey);
};

const canPerformMethod = (role, method, moduleKey = MODULES.DEFAULT) => {
  const allowed = getAllowedMethods(role, moduleKey);
  return allowed.includes(normalizeMethod(method));
};

const needsCenterRestriction = (role) => {
  const rule = getRoleRule(role);
  if (!rule) return true;
  return !!rule.centerScoped;
};

const getReportScope = (role) => {
  const rule = getRoleRule(role);
  return rule?.reportScope || "own";
};

const canMutatePolicy = (role) => {
  const roleKey = toRoleKey(role);
  return roleKey === "AppAdmin" || roleKey === "HQ";
};

module.exports = {
  METHODS,
  ROLES,
  ROLE_RULES,
  ROLE_KEY_BY_ID,
  MODULES,
  MODULE_ROUTE_MAP,
  getModuleFromRoute,
  getAllowedMethods,
  isModuleAllowed,
  canAccessRoute,
  canPerformMethod,
  needsCenterRestriction,
  getReportScope,
  canMutatePolicy,
};

