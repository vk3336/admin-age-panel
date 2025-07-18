// Performance optimization utilities

// Cache for API responses
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Optimized fetch with caching
export const cachedFetch = async (url: string, options?: RequestInit) => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    throw error;
  }
};

// Batch multiple API calls
export const batchFetch = async (urls: string[]) => {
  const promises = urls.map(url => cachedFetch(url));
  return Promise.all(promises);
};

// Debounce function for search inputs
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Optimized array operations
export const memoizedFilter = <T>(
  array: T[],
  predicate: (item: T) => boolean,
  deps: unknown[] = []
): T[] => {
  const key = JSON.stringify(deps);
  const cacheKey = `filter-${key}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T[];
  }
  
  const result = array.filter(predicate);
  cache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
};

// Clear cache
export const clearCache = () => {
  cache.clear();
};

// Preload critical resources
export const preloadResources = () => {
  const criticalPaths = [
    '/dashboard',
    '/products',
    '/category',
    '/login'
  ];
  
  criticalPaths.forEach(path => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    document.head.appendChild(link);
  });
}; 