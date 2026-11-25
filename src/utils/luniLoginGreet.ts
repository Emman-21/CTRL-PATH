export const LUNI_GREET_PENDING_KEY = 'ctrl_path_luni_greet_pending_v1';
export const LUNI_GREET_DELAY_MS = 500;

export type LuniGreetComponent = 'dashboard' | 'widget';

export interface LuniGreetCheckParams {
  pathname: string;
  component: LuniGreetComponent;
  luniEnabled?: boolean;
  isQuizFocusMode?: boolean;
  isQuizAnswering?: boolean;
  storage?: Storage;
}

export function markLuniLoginGreetPending(storage?: Storage): void {
  if (!storage) return;
  try {
    storage.setItem(LUNI_GREET_PENDING_KEY, '1');
  } catch {
    // Ignore storage quota or private-browsing errors
  }
}

export function hasLuniLoginGreetPending(storage?: Storage): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(LUNI_GREET_PENDING_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearLuniLoginGreetPending(storage?: Storage): void {
  if (!storage) return;
  try {
    storage.removeItem(LUNI_GREET_PENDING_KEY);
  } catch {
    // Ignore storage unavailability
  }
}

export function consumeLuniLoginGreetPending(storage?: Storage): boolean {
  if (!hasLuniLoginGreetPending(storage)) {
    return false;
  }
  clearLuniLoginGreetPending(storage);
  return true;
}

export function isDashboardRoute(pathname: string): boolean {
  return pathname === '/' || pathname === '/dashboard';
}

export function shouldPlayLuniLoginGreet({
  pathname,
  component,
  luniEnabled = true,
  isQuizFocusMode = false,
  isQuizAnswering = false,
  storage,
}: LuniGreetCheckParams): boolean {
  if (luniEnabled === false || isQuizFocusMode || isQuizAnswering) {
    return false;
  }
  if (!hasLuniLoginGreetPending(storage)) {
    return false;
  }
  if (component === 'widget' && isDashboardRoute(pathname)) {
    // DashboardLuniIdle is the primary mascot on "/" so the floating widget defers to it.
    return false;
  }
  return true;
}
