// Shared constant for Imam Profile tabs and Dashboard buttons
// This ensures consistency between DetailTabs and DashboardImamButtons

export const IMAM_TABS = [
  { id: "topics", label: "Jumah Topic", icon: "bx-book", gradient: "linear-gradient(135deg, #556ee6 0%, #6f42c1 100%)" },
  { id: "audio", label: "Jumah Audio", icon: "bx-music", gradient: "linear-gradient(135deg, #556ee6 0%, #f46a6a 100%)" },
  { id: "wisdomPearls", label: "Pearls of Wisdom", icon: "bx-diamond", gradient: "linear-gradient(135deg, #50a5f1 0%, #556ee6 100%)" },
  { id: "medical", label: "Medical Reimbursement", icon: "bx-plus-medical", gradient: "linear-gradient(135deg, #34c38f 0%, #50a5f1 100%)" },
  { id: "community", label: "Community Engagement", icon: "bx-group", gradient: "linear-gradient(135deg, #f46a6a 0%, #f1b44c 100%)" },
  { id: "nikahBonus", label: "Nikah Bonus", icon: "bx-heart", gradient: "linear-gradient(135deg, #556ee6 0%, #e83e8c 100%)" },
  { id: "muslimBonus", label: "New Muslim Bonus", icon: "bx-star", gradient: "linear-gradient(135deg, #50a5f1 0%, #34c38f 100%)" },
  { id: "babyBonus", label: "Baby Bonus", icon: "bx-gift", gradient: "linear-gradient(135deg, #f46a6a 0%, #f1734f 100%)" },
  { id: "relationships", label: "Relationships", icon: "bx-group", gradient: "linear-gradient(135deg, #556ee6 0%, #564ab1 100%)" },
  { id: "borehole", label: "Borehole Application", icon: "bx-droplet", gradient: "linear-gradient(135deg, #50a5f1 0%, #34c38f 100%)" },
  { id: "educationalDevelopment", label: "Educational Development", icon: "bxs-graduation", gradient: "linear-gradient(135deg, #34c38f 0%, #50a5f1 100%)" },
  { id: "treePlanting", label: "Tree Planting", icon: "bxs-tree", gradient: "linear-gradient(135deg, #556ee6 0%, #50a5f1 100%)" },
  { id: "waqfLoan", label: "WAQF Loan", icon: "bx-money", gradient: "linear-gradient(135deg, #f1b44c 0%, #556ee6 100%)" },
  { id: "hardshipRelief", label: "Hardship Relief", icon: "bx-heart", gradient: "linear-gradient(135deg, #f46a6a 0%, #e83e8c 100%)" },
  { id: "higherEducationRequest", label: "Higher Education Request", icon: "bxs-book-open", gradient: "linear-gradient(135deg, #50a5f1 0%, #564ab1 100%)" },
  { id: "tickets", label: "Tickets", icon: "bx-support", gradient: "linear-gradient(135deg, #556ee6 0%, #34c38f 100%)" },
];

// Mapping from DetailTabs IDs to Dashboard IDs (for consistency)
export const TAB_ID_MAPPING = {
  "khutbahTopics": "topics",
  "audioKhutbah": "audio",
  "pearls": "wisdomPearls",
  "medical": "medical",
  "engagement": "community",
  "nikah": "nikahBonus",
  "newMuslim": "muslimBonus",
  "newBaby": "babyBonus",
  "relationships": "relationships",
  "borehole": "borehole",
};

