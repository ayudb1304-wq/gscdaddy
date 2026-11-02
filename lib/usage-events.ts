/**
 * Tell the sidebar usage meter that sites or recommendations changed, so it
 * refetches. (It lives in the persistent dashboard shell, which router.refresh()
 * doesn't remount, so it used to show the count from first page load.)
 */
export const USAGE_CHANGED_EVENT = "gsc:usage-changed"

export function notifyUsageChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(USAGE_CHANGED_EVENT))
}
