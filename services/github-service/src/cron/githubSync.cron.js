import { syncGithubData, seedInitialData } from "../modules/github/github.service.js";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export function startGithubSyncCron() {

  seedInitialData()
    .then(() => {
      setTimeout(async () => {
        await syncGithubData();
      }, 5000);
    })
    .catch((err) => {
      console.error("❌ Error running initial seed/sync check:", err.message);
    });

  const intervalId = setInterval(async () => {
    await syncGithubData();
  }, FIVE_MINUTES_MS);

  return intervalId;
}
