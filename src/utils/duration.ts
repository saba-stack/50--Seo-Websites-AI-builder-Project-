export function ttlToMs(ttl: string): number {
  const match = ttl.match(/^(\d+)([smhd])$/i);
  if (!match) return 15 * 60 * 1000;

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return value * multipliers[unit];
}
