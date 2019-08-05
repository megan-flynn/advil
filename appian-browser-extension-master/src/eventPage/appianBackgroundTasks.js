import { getTasksForSite } from '../api/appianApi';

export async function getTaskCount() {
  try {
    const tasks = await getTasksForSite();
    return tasks ? tasks.length : 0;
  } catch (error) {
    return null;
  }
}
