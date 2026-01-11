// Shared constant for Imam Profile tabs and Dashboard buttons
// This ensures consistency between DetailTabs and DashboardImamButtons

export const IMAM_TABS = [
  { id: "topics", label: "Jumah Topic", icon: "bx-book", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { id: "audio", label: "Jumah Audio", icon: "bx-music", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { id: "wisdomPearls", label: "Wisdom Pearls", icon: "bx-diamond", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { id: "medical", label: "Medical", icon: "bx-plus-medical", gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
  { id: "community", label: "Community", icon: "bx-group", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  { id: "nikahBonus", label: "Nikah Bonus", icon: "bx-heart", gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)" },
  { id: "muslimBonus", label: "Muslim Bonus", icon: "bx-star", gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
  { id: "babyBonus", label: "Baby Bonus", icon: "bx-gift", gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
  { id: "relationships", label: "Relationships", icon: "bx-group", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { id: "borehole", label: "Borehole", icon: "bx-droplet", gradient: "linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%)" },
  { id: "financialAssistance", label: "Financial Assistance", icon: "bx-money", gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)" },
  { id: "educationalDevelopment", label: "Educational Development", icon: "bxs-graduation", gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)" },
  { id: "treePlanting", label: "Tree Planting", icon: "bxs-tree", gradient: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)" },
  { id: "waqfLoan", label: "WAQF Loan", icon: "bx-money", gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
  { id: "hardshipRelief", label: "Hardship Relief", icon: "bx-heart", gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
  { id: "higherEducationRequest", label: "Higher Education Request", icon: "bxs-book-open", gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
  { id: "tickets", label: "Tickets", icon: "bx-support", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
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

