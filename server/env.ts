/**
 * Environment detection utilities
 * Helps determine if the app is running on Replit or locally
 */

/**
 * Checks if the application is running in a Replit environment
 * @returns true if running on Replit, false if running locally
 */
export function isReplitEnvironment(): boolean {
  // Check for REPL_ID which is set by Replit
  return process.env.REPL_ID !== undefined;
}

/**
 * Checks if the Replit sidecar endpoint is available
 * Used for Object Storage authentication
 * @returns true if sidecar is available
 */
export async function isReplitSidecarAvailable(): Promise<boolean> {
  if (!isReplitEnvironment()) {
    return false;
  }

  try {
    const response = await fetch('http://127.0.0.1:1106/health', {
      method: 'GET',
      signal: AbortSignal.timeout(1000), // 1 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Gets the environment name for logging
 */
export function getEnvironmentName(): string {
  return isReplitEnvironment() ? 'Replit' : 'Local';
}
