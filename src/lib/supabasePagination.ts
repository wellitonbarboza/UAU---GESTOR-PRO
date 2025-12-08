const DEFAULT_PAGE_SIZE = 1000;

export async function fetchAllSupabasePages<T>(
  buildRangeQuery: (
    from: number,
    to: number
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  pageSize = DEFAULT_PAGE_SIZE
) {
  const allRows: T[] = [];

  for (let page = 0; ; page += 1) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await buildRangeQuery(from, to);

    if (error) {
      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      allRows.push(...data);
    }

    if (!data || data.length < pageSize) {
      break;
    }
  }

  return allRows;
}
