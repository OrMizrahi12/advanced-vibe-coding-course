const tasks = [
  { id: 1, title: "Wire auth", status: "done" },
  { id: 2, title: "Build board", status: "open" },
];

export function listTasks() {
  return tasks.map((t) => ({ ...t }));
}

export function getOpenCount() {
  return tasks.filter((t) => t.status === "open").length;
}
