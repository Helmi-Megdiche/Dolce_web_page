export const tabIds = [
  "menu",
  "hours",
  "reservations",
  "settings",
  "profile",
] as const;

export type TabId = (typeof tabIds)[number];

export function isTabId(value: string | null | undefined): value is TabId {
  return !!value && (tabIds as readonly string[]).includes(value);
}
