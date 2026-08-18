/**
 * Runs async tasks with at most `limit` running concurrently. Each task is
 * a zero-arg function returning a promise; failures don't stop the other
 * tasks since each is awaited independently inside its own worker loop.
 */
export async function runWithLimit(tasks, limit) {
  let index = 0;
  async function worker() {
    while (index < tasks.length) {
      const current = index++;
      try {
        await tasks[current]();
      } catch {
        // Individual task failures are handled by the task itself
        // (it updates its own UI state) — nothing to do here.
      }
    }
  }
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker);
  await Promise.all(workers);
}
