// src/data/faqData.ts
// BastBot FAQ Database
// All questions, answers, keywords, and phrase variants for natural language matching

export type FAQItem = {
  id: number;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  phrases: string[];
  links?: { text: string; url: string }[];
};

export const FAQ_CATEGORIES = [
  "Understanding Domestic Violence",
  "Getting Help & Finding Shelter",
  "Safety Planning",
  "Legal & Financial Help",
  "Using Bastet",
] as const;

export const FAQ_DATA: FAQItem[] = [
  // ─── Category 1: Understanding Domestic Violence ────────────────────────────
  {
    id: 1,
    category: "Understanding Domestic Violence",
    question: "What is domestic violence?",
    answer: "Domestic violence is a pattern of controlling behavior that can include physical abuse, emotional abuse, sexual abuse, or financial abuse. Abusers use these tactics to gain power and control over their partner. It affects people of all backgrounds and can happen to anyone.",
    keywords: ["domestic violence", "abuse", "what is", "definition", "dv", "control", "pattern"],
    phrases: [
      "what is domestic violence",
      "what is abuse",
      "define domestic violence",
      "what does domestic violence mean",
      "what is dv",
      "explain domestic violence",
    ],
  },
  {
    id: 2,
    category: "Understanding Domestic Violence",
    question: "What are the warning signs of abuse?",
    answer: "Common warning signs include: moving very quickly into a relationship, extreme jealousy or controlling behavior, isolating you from friends and family, blaming you for their actions, criticizing your appearance, or making threats. If you feel afraid or controlled, trust your instincts.",
    keywords: ["warning signs", "red flags", "signs of abuse", "abuser", "recognize", "identify", "jealous", "controlling", "isolate"],
    phrases: [
      "warning signs of abuse",
      "red flags of abuse",
      "how to tell if someone is abusive",
      "signs of an abuser",
      "how do I know if",
      "is this abuse",
      "recognize abuse",
    ],
  },
  {
    id: 3,
    category: "Understanding Domestic Violence",
    question: "Why do people stay in abusive relationships?",
    answer: "Leaving is complicated and dangerous. Abusers work hard to trap victims through isolation, financial control, threats, and emotional manipulation. Many survivors fear the violence will get worse if they leave. Remember: the abuse is not your fault, and you deserve support.",
    keywords: ["why stay", "why don't they leave", "leave", "stay", "trapped", "can't leave", "scared to leave"],
    phrases: [
      "why do people stay",
      "why don't victims leave",
      "why can't I leave",
      "scared to leave",
      "trapped in relationship",
      "afraid to leave",
    ],
  },
  {
    id: 4,
    category: "Understanding Domestic Violence",
    question: "Can abusers change?",
    answer: "Change is possible, but only if the abuser chooses to stop and commits to serious, long-term work. Many abusers stop one form of abuse (like physical violence) but continue others (like emotional or financial control). Your safety comes first.",
    keywords: ["can they change", "abuser change", "will he change", "will she change", "reform", "stop abusing"],
    phrases: [
      "can abusers change",
      "will my abuser change",
      "can they stop",
      "do abusers change",
      "will the abuse stop",
    ],
  },

  // ─── Category 2: Getting Help & Finding Shelter ─────────────────────────────
  {
    id: 5,
    category: "Getting Help & Finding Shelter",
    question: "What resources are available for me in South Carolina?",
    answer: "In SC, you can access free confidential help through local domestic violence programs. They offer emergency shelter, safety planning, counseling, legal help, and 24/7 hotlines. Use Bastet to find shelters near you, or call the National DV Hotline at 1-800-799-7233.",
    keywords: ["resources", "help", "south carolina", "sc", "available", "services", "programs"],
    phrases: [
      "what resources are available",
      "where can I get help",
      "help in south carolina",
      "resources in sc",
      "what help is available",
    ],
    links: [
      { text: "SCCADVASA", url: "https://www.sccadvasa.org/get-help/" },
    ],
  },
  {
    id: 6,
    category: "Getting Help & Finding Shelter",
    question: "What should I bring to a shelter?",
    answer: "If possible, bring: ID documents (driver's license, birth certificates, Social Security cards), medications, money or credit cards, important papers (lease, insurance, court orders), clothes, and items for your children. Don't delay leaving if you can't gather everything — your safety is the priority.",
    keywords: ["bring to shelter", "pack", "what to bring", "documents", "id", "essentials", "bag"],
    phrases: [
      "what should I bring to a shelter",
      "what to pack",
      "what do I need at a shelter",
      "packing for shelter",
      "what documents do I need",
    ],
  },
  {
    id: 7,
    category: "Getting Help & Finding Shelter",
    question: "What if the shelter is full?",
    answer: "Shelters prioritize safety even when beds are limited. Call ahead using the number listed in Bastet. Staff can help you find alternative safe housing, connect you to hotels, or refer you to other programs. They will not turn you away without offering support.",
    keywords: ["shelter full", "no beds", "no room", "capacity", "full", "wait list"],
    phrases: [
      "what if the shelter is full",
      "no beds available",
      "shelter has no room",
      "what if there's no space",
      "shelter at capacity",
    ],
  },
  {
    id: 8,
    category: "Getting Help & Finding Shelter",
    question: "Are shelters safe and confidential?",
    answer: "Yes. Shelter locations are kept confidential to protect residents. Staff are trained in safety and privacy. You do not have to use your real name, and your information will not be shared without your permission.",
    keywords: ["safe", "confidential", "privacy", "secret", "anonymous", "protected"],
    phrases: [
      "are shelters safe",
      "is it confidential",
      "will they keep me safe",
      "shelter privacy",
      "anonymous shelter",
    ],
  },
  {
    id: 9,
    category: "Getting Help & Finding Shelter",
    question: "Can I bring my children to a shelter?",
    answer: "Yes. Most shelters welcome children and provide services for them, including counseling and childcare support.",
    keywords: ["children", "kids", "bring kids", "children allowed", "family"],
    phrases: [
      "can I bring my children",
      "bring kids to shelter",
      "children allowed",
      "shelter with kids",
    ],
  },
  {
    id: 10,
    category: "Getting Help & Finding Shelter",
    question: "Can I bring my pet?",
    answer: "Some shelters have space for pets or can connect you to foster programs. Call ahead to ask about their pet policy.",
    keywords: ["pet", "dog", "cat", "animal", "pets allowed"],
    phrases: [
      "can I bring my pet",
      "pets allowed",
      "shelter with pets",
      "bring my dog",
      "bring my cat",
    ],
  },

  // ─── Category 3: Safety Planning ────────────────────────────────────────────
  {
    id: 11,
    category: "Safety Planning",
    question: "What is a safety plan?",
    answer: "A safety plan is a personalized plan to help you stay safer whether you're still in the relationship, preparing to leave, or after you've left. It includes steps like identifying safe places to go, keeping important documents accessible, and having a code word to signal danger to trusted friends.",
    keywords: ["safety plan", "planning", "prepare", "plan", "escape plan"],
    phrases: [
      "what is a safety plan",
      "how do I make a safety plan",
      "safety planning",
      "create safety plan",
    ],
    links: [
      { text: "Safety Planning Guide", url: "https://www.thehotline.org/plan-for-safety/" },
    ],
  },
  {
    id: 12,
    category: "Safety Planning",
    question: "How do I leave safely?",
    answer: "Plan ahead when possible. Pack a bag with essentials and keep it somewhere safe. Choose a time when your abuser is away. Tell a trusted person your plan. Have a safe place to go lined up. If you're in immediate danger, call 911 or leave immediately.",
    keywords: ["leave", "escape", "get out", "how to leave", "leaving", "exit"],
    phrases: [
      "how do I leave",
      "how to leave safely",
      "escape plan",
      "how do I get out",
      "leaving abuser",
    ],
  },
  {
    id: 13,
    category: "Safety Planning",
    question: "What if my abuser tracks my phone?",
    answer: "Abusers often use phones to monitor and control victims. Use a safer device (a friend's phone, library computer, or public phone) to search for help or call hotlines. Learn more about technology safety at TechSafety.org.",
    keywords: ["tracking", "phone", "monitored", "spyware", "technology", "tracked", "gps"],
    phrases: [
      "my phone is tracked",
      "abuser tracking phone",
      "is my phone monitored",
      "phone spyware",
      "technology abuse",
    ],
    links: [
      { text: "Tech Safety Resources", url: "https://www.techsafety.org/resources-survivors" },
    ],
  },
  {
    id: 14,
    category: "Safety Planning",
    question: "Can I call 911?",
    answer: "Yes. If you are in immediate danger, call 911. You can also text 911 in many areas if calling isn't safe.",
    keywords: ["911", "emergency", "police", "call police", "immediate danger"],
    phrases: [
      "can I call 911",
      "should I call police",
      "emergency help",
      "call for help",
    ],
  },

  // ─── Category 4: Legal & Financial Help ─────────────────────────────────────
  {
    id: 15,
    category: "Legal & Financial Help",
    question: "What is a protection order (restraining order)?",
    answer: "A protection order is a legal document that tells your abuser to stay away from you. It can include your home, workplace, and children. Violating a protection order is a crime. Advocates at local programs can help you file for one.",
    keywords: ["protection order", "restraining order", "order of protection", "legal", "court order"],
    phrases: [
      "what is a protection order",
      "restraining order",
      "order of protection",
      "how do I get a restraining order",
    ],
    links: [
      { text: "WomensLaw.org", url: "https://www.womenslaw.org/" },
    ],
  },
  {
    id: 16,
    category: "Legal & Financial Help",
    question: "How do I get legal help in South Carolina?",
    answer: "Many SC domestic violence programs offer free legal advocacy. You can also contact SC Legal Services at 1-888-346-5592 or visit WomensLaw.org for state-specific legal information on custody, divorce, and protection orders.",
    keywords: ["legal help", "lawyer", "attorney", "legal aid", "free legal", "custody", "divorce"],
    phrases: [
      "how do I get legal help",
      "find a lawyer",
      "free legal help",
      "legal services",
      "lawyer in sc",
    ],
    links: [
      { text: "WomensLaw.org", url: "https://www.womenslaw.org/" },
      { text: "SC Legal Services", url: "https://sclegal.org/" },
    ],
  },
  {
    id: 17,
    category: "Legal & Financial Help",
    question: "What is financial abuse?",
    answer: "Financial abuse happens when an abuser controls your access to money, prevents you from working, ruins your credit, or forces you to hand over earnings. It's designed to trap you and make leaving harder.",
    keywords: ["financial abuse", "money", "economic abuse", "control money", "financial control"],
    phrases: [
      "what is financial abuse",
      "economic abuse",
      "controlling money",
      "financial control",
    ],
    links: [
      { text: "Financial Abuse Toolkit", url: "https://nnedv.org/resources-library/financial-abuse-toolkit/" },
    ],
  },
  {
    id: 18,
    category: "Legal & Financial Help",
    question: "Can I get financial help if I leave?",
    answer: "Yes. Many shelters and programs offer transitional funds, help finding housing, job training, and connections to benefits like SNAP or TANF. Advocates can help you rebuild financial independence.",
    keywords: ["financial help", "money help", "financial assistance", "benefits", "job training", "housing help"],
    phrases: [
      "can I get financial help",
      "financial assistance",
      "help with money",
      "emergency funds",
    ],
  },

  // ─── Category 5: Using Bastet ───────────────────────────────────────────────
  {
    id: 19,
    category: "Using Bastet",
    question: "How does Bastet work?",
    answer: "Bastet shows you domestic violence shelters near your current location. Tap a shelter to see its address, phone number, and hours. You can call directly from the app or get directions. Bastet does not store your data or create an account.",
    keywords: ["how does bastet work", "how to use", "app", "bastet", "how it works"],
    phrases: [
      "how does bastet work",
      "how do I use bastet",
      "how to use this app",
      "what does bastet do",
    ],
  },
  {
    id: 20,
    category: "Using Bastet",
    question: "Does Bastet track me or save my information?",
    answer: "No. Bastet does not track your location, save your searches, or store any data. It uses your phone's GPS only to show nearby shelters — that information never leaves your device.",
    keywords: ["track", "privacy", "data", "save", "store", "gps", "location", "tracking"],
    phrases: [
      "does bastet track me",
      "is my data saved",
      "does bastet store data",
      "privacy",
      "tracking",
    ],
  },
  {
    id: 21,
    category: "Using Bastet",
    question: "What is Quick Exit?",
    answer: "Quick Exit is a button at the top of the app. If someone walks in while you're using Bastet, tap Quick Exit to close the app immediately and clear it from your recent apps. It helps you stay safe if your phone is monitored.",
    keywords: ["quick exit", "exit", "close app", "hide", "emergency exit"],
    phrases: [
      "what is quick exit",
      "how do I exit",
      "close the app",
      "hide the app",
      "emergency close",
    ],
  },
  {
    id: 22,
    category: "Using Bastet",
    question: "What does \"Call for Address\" mean?",
    answer: "Some shelters keep their exact location confidential for safety. \"Call for Address\" means you need to call the shelter first — they will give you the address or arrange a safe meeting location.",
    keywords: ["call for address", "no address", "confidential", "hidden address", "call first"],
    phrases: [
      "call for address",
      "why no address",
      "confidential location",
      "hidden shelter",
    ],
  },
  {
    id: 23,
    category: "Using Bastet",
    question: "Can I use Bastet if I don't have internet?",
    answer: "You need a data or WiFi connection to load the shelter list. Once loaded, you can call hotlines offline. Bastet works best with an active connection.",
    keywords: ["internet", "offline", "wifi", "data", "no connection", "no internet"],
    phrases: [
      "can I use without internet",
      "offline mode",
      "no wifi",
      "works offline",
    ],
  },
  {
    id: 24,
    category: "Using Bastet",
    question: "Is Bastet free?",
    answer: "Yes. Bastet is completely free to download and use.",
    keywords: ["free", "cost", "price", "pay"],
    phrases: [
      "is bastet free",
      "does it cost money",
      "how much",
      "free app",
    ],
  },

  // ─── Additional high-priority questions ─────────────────────────────────────
  {
    id: 25,
    category: "Getting Help & Finding Shelter",
    question: "What are my options for getting help?",
    answer: "If you're in immediate danger, call 911. For shelter, type 'find shelter near me' and I'll show you the nearest options with directions. You can also call the National DV Hotline at 1-800-799-7233 — they're available 24/7 and can help you find safe housing.",
    keywords: ["options", "getting help", "what can i do", "help available"],
    phrases: [
      "what are my options",
      "what can i do",
      "how can i get help",
      "what help is available",
    ],
  },
  {
    id: 26,
    category: "Understanding Domestic Violence",
    question: "Is what I'm experiencing abuse?",
    answer: "If you feel afraid, controlled, constantly criticized, isolated from friends and family, or forced to do things you don't want to do, these are signs of abuse. You don't need to be physically hurt for it to be abuse. Trust your instincts. If you're questioning whether this is abuse, that's often a sign that something is wrong. You can call the National DV Hotline at 1-800-799-7233 to talk it through confidentially.",
    keywords: ["is this abuse", "am I being abused", "experiencing abuse", "questioning", "not sure"],
    phrases: [
      "is this abuse",
      "am I being abused",
      "is what I'm experiencing abuse",
      "not sure if abuse",
      "questioning if abuse",
    ],
  },
];

export const FALLBACK_MESSAGE = `I don't have an answer for that question right now. Here are some ways I can help:

**Browse by topic:**
• Understanding Domestic Violence
• Getting Help & Finding Shelter
• Safety Planning
• Legal & Financial Help
• Using Bastet

**Or call the National DV Hotline:**
1-800-799-7233 (24/7, confidential)`;

export const GREETING_MESSAGE = `Hi, I'm BastBot. I can answer questions about domestic violence, finding help, safety planning, and using Bastet.

**You can ask things like:**
• "What is domestic violence?"
• "Where can I find a shelter?"
• "How does Quick Exit work?"
• "What is a protection order?"

**Or browse by category below.**`;
