/** Build the href used when opening a tipster profile from public surfaces. */
export function profileAccessHref(slug: string, isAuthenticated: boolean): string {
  const target = `/predictors/${slug}`;
  if (isAuthenticated) return target;
  return `/signin?next=${encodeURIComponent(target)}`;
}
