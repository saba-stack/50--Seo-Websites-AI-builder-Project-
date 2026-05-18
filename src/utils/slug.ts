import slugify from "slugify";

export function buildSlug(value: string) {
  return slugify(value, { lower: true, strict: true, trim: true });
}
