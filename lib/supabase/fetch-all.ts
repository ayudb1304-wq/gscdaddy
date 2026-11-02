/**
 * Reads every page of a PostgREST query. Supabase returns at most 1,000 rows per request, so
 * summing an unpaged gsc_data query silently undercounts any site with more rows than that.
 *
 * `page(from, to)` must build the query with a stable order (end with `.order("id")`) and
 * apply `.range(from, to)`.
 */
export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
  { pageSize = 1000, maxRows = 200_000 }: { pageSize?: number; maxRows?: number } = {}
): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; from < maxRows; from += pageSize) {
    const { data, error } = await page(from, from + pageSize - 1)
    if (error) throw error
    if (!data) break
    rows.push(...data)
    if (data.length < pageSize) break
  }
  return rows
}
