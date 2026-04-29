import { safeAssetPath } from "./security";

export function assetPath(path: string) {
  return `${import.meta.env.BASE_URL}${safeAssetPath(path)}`;
}
