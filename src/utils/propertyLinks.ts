export function propertyDetailHref(id: string) {
  return `${import.meta.env.BASE_URL}property/${encodeURIComponent(id)}`;
}
