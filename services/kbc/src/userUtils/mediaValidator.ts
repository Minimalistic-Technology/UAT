import MediaAsset from "../models/MediaAsset";

export async function verifyMediaRefs(mediaRefs: string[]) {
  if (!mediaRefs || mediaRefs.length === 0) return { valid: [], missing: [] };

  const existing = await MediaAsset.find({ _id: { $in: mediaRefs } }).select("_id");
  const existingIds = existing.map((m) => m._id.toString());
  const missing = mediaRefs.filter((r) => !existingIds.includes(r));

  return { valid: existingIds, missing };
}
