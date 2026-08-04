export function threadIdFor(userIdA: string, userIdB: string) {
  return [userIdA, userIdB].sort().join(":");
}
