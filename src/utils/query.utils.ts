export function generateRecursiveIncludeQuery<
  T extends {
    [key: string]: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      include: any;
    };
  }
>(baseQuery: T, levels: number) {
  const result = JSON.parse(JSON.stringify(baseQuery)) as T;
  const baseKey = Object.keys(baseQuery)[0];

  let pointer = result;

  for (let i = 1; i < levels; i++) {
    pointer[baseKey].include = JSON.parse(
      JSON.stringify({
        ...baseQuery[baseKey].include,
        ...baseQuery,
      })
    );
    pointer = pointer[baseKey].include;
  }

  return result;
}
