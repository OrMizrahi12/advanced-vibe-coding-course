export const INITIAL_ITEMS = [
  { id: 'dark-logs', title: 'Live Stream Logs', votes: 42 },
  { id: 'rls-audit', title: 'Auto RLS Audit', votes: 19 }
];

export function incrementVotes(items, id) {
  const item = items.find((entry) => entry.id === id);
  if (!item) return null;
  item.votes += 1;
  return item.votes;
}
