/**
 * Helper class for generating consistent cache keys
 */
export class CacheHelper {
  /**
   * Generate cache key for user data
   * @param userId User ID
   * @returns Cache key
   */
  static getUserCacheKey(userId: string | number): string {
    return `user:${userId}`;
  }

  /**
   * Generate cache key for session data
   * @param sessionId Session ID
   * @returns Cache key
   */
  static getSessionCacheKey(sessionId: string): string {
    return `session:${sessionId}`;
  }

  /**
   * Generate pattern to clear all user-related cache
   * @param userId User ID
   * @returns Pattern string
   */
  static getUserCachePattern(userId: string | number): string {
    return `user:${userId}*`;
  }

}
