export function renderSummary(tasks) {
  const open = tasks.filter((t) => t.status === "open");
  return `Tasks: ${tasks.length} total, ${open.length} open`;
}

export function renderTaskList(tasks) {
  return tasks
    .map((t) => `[${t.status === "done" ? "x" : " "}] ${t.title}`)
    .join("\n");
}
