export interface PaginateOptions {
  page?: number | null;
  limit?: number | null;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

/**
 * Helper to calculate `skip` and `take` for Prisma queries.
 * @param options Pagination options (page, limit)
 * @returns object with skip and take
 */
export const getPaginationArgs = (options?: PaginateOptions) => {
  const page = options?.page && options.page > 0 ? options.page : 1;
  const limit = options?.limit && options.limit > 0 ? options.limit : 10;

  return {
    skip: (page - 1) * limit,
    take: limit,
  };
};

/**
 * Helper to format Prisma query results into a paginated response.
 * @param data Array of items from Prisma findMany
 * @param total Total count from Prisma count
 * @param options Pagination options used for the query
 */
export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  options?: PaginateOptions
): PaginatedResult<T> => {
  const currentPage = options?.page && options.page > 0 ? options.page : 1;
  const perPage = options?.limit && options.limit > 0 ? options.limit : 10;
  const lastPage = Math.ceil(total / perPage);

  return {
    data,
    meta: {
      total,
      lastPage,
      currentPage,
      perPage,
      prev: currentPage > 1 ? currentPage - 1 : null,
      next: currentPage < lastPage ? currentPage + 1 : null,
    },
  };
};

export interface CursorPaginationOptions<TCursor = string> {
  cursor?: TCursor | null;
  limit?: number | null;
}

export interface CursorPaginatedResult<T, TCursor = string> {
  data: T[];
  meta: {
    nextCursor: TCursor | null;
    hasMore: boolean;
  };
}

/**
 * Helper to calculate skip, take, and cursor for Prisma cursor-based queries.
 * Requests `limit + 1` items to determine if there is a next page.
 * @param options Cursor pagination options (cursor, limit)
 */
export const getCursorPaginationArgs = <TCursor>(
  options?: CursorPaginationOptions<TCursor>
) => {
  const limit = options?.limit && options.limit > 0 ? options.limit : 10;

  const args: { take: number; skip?: number; cursor?: { id: TCursor } } = {
    take: limit + 1, // Fetch one extra to know if there's a next page
  };

  if (options?.cursor) {
    args.cursor = { id: options.cursor };
    args.skip = 1; // Skip the cursor itself
  }

  return args;
};

/**
 * Helper to format Prisma query results into a cursor-paginated response.
 * @param data Array of items from Prisma findMany
 * @param options Cursor pagination options used for the query
 * @param getCursor Function to extract the cursor from an item (default: item.id)
 */
export const createCursorPaginatedResponse = <T>(
  data: T[],
  options?: CursorPaginationOptions<any>,
  getCursor: (item: T) => any = (item: any) => item.id
): CursorPaginatedResult<T, any> => {
  const limit = options?.limit && options.limit > 0 ? options.limit : 10;
  const hasMore = data.length > limit;

  if (hasMore) {
    data.pop(); // Remove the extra item
  }

  const nextCursor =
    hasMore && data.length > 0 ? getCursor(data[data.length - 1]) : null;

  return {
    data,
    meta: {
      nextCursor,
      hasMore,
    },
  };
};
