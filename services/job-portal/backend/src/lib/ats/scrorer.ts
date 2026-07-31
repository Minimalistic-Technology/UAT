export interface ATSResult {
  overallScore: number;
  sectionScore: number;
  formattingScore: number;
  keywordScore: number;
  contentScore: number;
  sectionsFound: string[];
  sectionsMissing: string[];
  matchedKeywords: string[];
}

const SECTION_PATTERNS: Record<string, RegExp> = {
  contact: /contact|email|phone|linkedin|github/i,
  summary: /summary|objective|profile|about/i,
  experience: /experience|employment|work history|career/i,
  education: /education|degree|university|college|academic/i,
  skills: /skills|technologies|competencies|tools/i,
  projects: /projects/i,
  certifications: /certifications?|courses?|training/i,
};

function detectSections(text: string): string[] {
  return Object.entries(SECTION_PATTERNS)
    .filter(([, pattern]) => pattern.test(text))
    .map(([name]) => name);
}

const GENERAL_KEYWORDS = [
  // soft skills
  "leadership",
  "communication",
  "collaboration",
  "problem-solving",
  "teamwork",
  "management",
  "mentoring",
  "agile",
  "scrum",

  // tech (broad)
  "javascript",
  "typescript",
  "python",
  "java",
  "sql",
  "react",
  "node",
  "aws",
  "docker",
  "git",
  "api",
  "database",
  "testing",
  "ci/cd",
  
  // action verbs (strong resume signal)
  "developed",
  "built",
  "designed",
  "implemented",
  "led",
  "managed",
  "improved",
  "optimized",
  "delivered",
  "architected",
];

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return GENERAL_KEYWORDS.filter((kw) => lower.includes(kw));
}

function scoreFormatting(text: string): number {
  let score = 100;
  if (/\|{2,}/.test(text)) score -= 20; // table artifacts
  if (/[^\x00-\x7F]{8,}/.test(text)) score -= 15; // encoding junk
  if ((text.match(/^.{1,8}$/gm) || []).length > 20) score -= 15; // column bleed
  if (text.length < 300) score -= 25; // too short
  if (!/\d/.test(text)) score -= 10; // no numbers at all
  return Math.max(0, score);
}

function scoreContent(text: string): number {
  let score = 50; // base
  const metrics = text.match(/\d+[\+%x]?/g) || [];
  score += Math.min(metrics.length * 3, 30); // up to +30 for numbers/metrics
  if (text.length > 1500) score += 10; // reasonable length
  if (text.length > 3000) score -= 10; // too long
  return Math.min(100, Math.max(0, score));
}

export function scoreResume(text: string): Omit<ATSResult, "suggestions"> {
  const sectionsFound = detectSections(text);
  const required = ["contact", "experience", "education", "skills"];
  const sectionsMissing = required.filter((s) => !sectionsFound.includes(s));
  const sectionScore = Math.round(
    (sectionsFound.filter((s) => required.includes(s)).length /
      required.length) *
      100,
  );
  const matchedKeywords = extractKeywords(text);
  const keywordScore = Math.min(
    100,
    Math.round((matchedKeywords.length / 12) * 100),
  );
  const formattingScore = scoreFormatting(text);
  const contentScore = scoreContent(text);

  const overallScore = Math.round(
    sectionScore * 0.3 +
      keywordScore * 0.25 +
      formattingScore * 0.25 +
      contentScore * 0.2,
  );

  return {
    overallScore,
    sectionScore,
    formattingScore,
    keywordScore,
    contentScore,
    sectionsFound,
    sectionsMissing,
    matchedKeywords,
  };
}
