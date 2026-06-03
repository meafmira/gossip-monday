/**
 * Normalized site base path, always with a trailing slash.
 *
 * Astro exposes the configured `base` via `import.meta.env.BASE_URL`, but it is
 * not guaranteed to end with a slash. Internal links should build on this value
 * so local/dev and future hosting changes stay safe.
 */
export const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
