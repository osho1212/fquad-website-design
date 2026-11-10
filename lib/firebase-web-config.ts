/**
 * Looks up the Firebase web app's public settings (the web API key above all)
 * with the service account the site already uses, so the "Continue with Google"
 * button needs no extra setting in Vercel. The key is public by design: it names
 * the project, it does not unlock it.
 *
 * Kept free of imports from the rest of the site so a test can run it alone
 * (scripts/test-firebase-web-config.mjs). Never throws: any failure is `null`.
 */

const BASE = 'https://firebase.googleapis.com/v1beta1';

export interface WebConfig {
  apiKey: string;
  authDomain?: string;
  projectId?: string;
}

export async function fetchWebConfig(opts: {
  accessToken: string;
  projectId: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}): Promise<WebConfig | null> {
  const { accessToken, projectId, fetchImpl = fetch, timeoutMs = 4000 } = opts;
  const headers = { Authorization: `Bearer ${accessToken}` };

  const get = async (url: string) => {
    const res = await fetchImpl(url, { headers, signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as any;
  };

  try {
    const project = encodeURIComponent(projectId);
    const list = await get(`${BASE}/projects/${project}/webApps`);
    const apps: any[] = Array.isArray(list?.apps) ? list.apps : [];
    for (const app of apps) {
      if (typeof app?.appId !== 'string' || !app.appId) continue;
      const cfg = await get(`${BASE}/projects/${project}/webApps/${encodeURIComponent(app.appId)}/config`);
      if (typeof cfg?.apiKey === 'string' && cfg.apiKey) {
        return {
          apiKey: cfg.apiKey,
          authDomain: typeof cfg.authDomain === 'string' ? cfg.authDomain : undefined,
          projectId: typeof cfg.projectId === 'string' ? cfg.projectId : undefined,
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}
