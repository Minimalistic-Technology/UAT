// Lightweight, dependency-free keyword/text matching utilities (TF-IDF + cosine
// similarity, Jaccard similarity). Used for content-based job recommendations —
// no AI/ML models involved, just classic information-retrieval scoring.

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "of", "to", "in", "on", "for", "with",
  "at", "by", "from", "as", "is", "are", "was", "were", "be", "been", "being",
  "this", "that", "these", "those", "it", "its", "into", "about", "we", "you",
  "will", "can", "our", "your", "their", "have", "has", "had", "not", "no",
  "etc", "using", "use", "per", "job", "role", "work", "years", "year",
]);

/** Lowercases, strips punctuation (keeping tokens like "c++", "node.js", "3+"), and drops stopwords/short tokens. */
export function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }
  const length = tokens.length || 1;
  for (const [term, count] of tf) {
    tf.set(term, count / length);
  }
  return tf;
}

/** Smoothed IDF (1 + ln((N + 1) / (df + 1))) over a corpus of tokenized documents. */
export function buildIdf(documents: string[][]): Map<string, number> {
  const documentFrequency = new Map<string, number>();
  for (const doc of documents) {
    for (const term of new Set(doc)) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
    }
  }

  const totalDocs = documents.length;
  const idf = new Map<string, number>();
  for (const [term, df] of documentFrequency) {
    idf.set(term, 1 + Math.log((totalDocs + 1) / (df + 1)));
  }
  return idf;
}

const DEFAULT_IDF = 1;

export function tfidfVector(tokens: string[], idf: Map<string, number>): Map<string, number> {
  const tf = termFrequency(tokens);
  const vector = new Map<string, number>();
  for (const [term, freq] of tf) {
    vector.set(term, freq * (idf.get(term) ?? DEFAULT_IDF));
  }
  return vector;
}

export function cosineSimilaritySparse(a: Map<string, number>, b: Map<string, number>): number {
  if (a.size === 0 || b.size === 0) return 0;

  let normA = 0;
  for (const value of a.values()) normA += value * value;
  let normB = 0;
  for (const value of b.values()) normB += value * value;
  if (normA === 0 || normB === 0) return 0;

  const [smaller, larger] = a.size <= b.size ? [a, b] : [b, a];
  let dotProduct = 0;
  for (const [term, value] of smaller) {
    const otherValue = larger.get(term);
    if (otherValue) dotProduct += value * otherValue;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/** Case-insensitive Jaccard similarity between two lists of short phrases (e.g. skills). */
export function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a.map((item) => item.trim().toLowerCase()).filter(Boolean));
  const setB = new Set(b.map((item) => item.trim().toLowerCase()).filter(Boolean));
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }

  const unionSize = setA.size + setB.size - intersection;
  return unionSize === 0 ? 0 : intersection / unionSize;
}
