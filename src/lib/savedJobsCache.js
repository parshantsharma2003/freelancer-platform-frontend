const STORAGE_KEY = 'savedJobsCache';

export const getSavedJobsCache = () => {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);

    if (!rawValue || rawValue === 'undefined' || rawValue === 'null') {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const setSavedJobsCache = (jobs) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(jobs) ? jobs : []));
  } catch {
    // Ignore storage failures.
  }
};

export const addSavedJobToCache = (job) => {
  if (!job?._id) return;

  const currentJobs = getSavedJobsCache();
  const nextJobs = currentJobs.some((savedJob) => savedJob._id === job._id)
    ? currentJobs
    : [...currentJobs, job];

  setSavedJobsCache(nextJobs);
};

export const removeSavedJobFromCache = (jobId) => {
  if (!jobId) return;

  const nextJobs = getSavedJobsCache().filter((job) => job._id !== jobId);
  setSavedJobsCache(nextJobs);
};