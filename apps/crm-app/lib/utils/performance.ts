// Performance monitoring utilities for customer list optimization

interface PerformanceMetrics {
  loadTime: number
  searchTime: number
  renderTime: number
  cacheHitRate: number
  memoryUsage: number
}

interface PerformanceMark {
  name: string
  startTime: number
  endTime?: number
  duration?: number
}

class PerformanceMonitor {
  private marks: Map<string, PerformanceMark> = new Map()
  private cacheStats = { hits: 0, misses: 0 }

  // Mark the start of a performance measurement
  startMark(name: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      const startTime = performance.now()
      this.marks.set(name, { name, startTime })

      // Use browser's performance API if available
      if (performance.mark) {
        performance.mark(`${name}-start`)
      }
    }
  }

  // End a performance measurement and calculate duration
  endMark(name: string): number | null {
    const mark = this.marks.get(name)
    if (!mark || typeof window === 'undefined') return null

    const endTime = performance.now()
    const duration = endTime - mark.startTime

    this.marks.set(name, {
      ...mark,
      endTime,
      duration,
    })

    // Use browser's performance API if available
    if (performance.mark && performance.measure) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
    }

    return duration
  }

  // Get duration of a completed measurement
  getDuration(name: string): number | null {
    const mark = this.marks.get(name)
    return mark?.duration ?? null
  }

  // Record cache hit/miss for cache hit rate calculation
  recordCacheHit(): void {
    this.cacheStats.hits++
  }

  recordCacheMiss(): void {
    this.cacheStats.misses++
  }

  // Calculate cache hit rate
  getCacheHitRate(): number {
    const total = this.cacheStats.hits + this.cacheStats.misses
    return total > 0 ? (this.cacheStats.hits / total) * 100 : 0
  }

  // Get memory usage if available
  getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      return memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
    }
    return 0
  }

  // Get comprehensive performance metrics
  getMetrics(): PerformanceMetrics {
    return {
      loadTime: this.getDuration('customerListLoad') ?? 0,
      searchTime: this.getDuration('customerSearch') ?? 0,
      renderTime: this.getDuration('customerRender') ?? 0,
      cacheHitRate: this.getCacheHitRate(),
      memoryUsage: this.getMemoryUsage(),
    }
  }

  // Log performance metrics to console (development only)
  logMetrics(): void {
    if (process.env.NODE_ENV === 'development') {
      const metrics = this.getMetrics()
      console.group('🔥 Phoenix Performance Metrics')
      console.log(`📊 Load Time: ${metrics.loadTime.toFixed(2)}ms`)
      console.log(`🔍 Search Time: ${metrics.searchTime.toFixed(2)}ms`)
      console.log(`🎨 Render Time: ${metrics.renderTime.toFixed(2)}ms`)
      console.log(`💾 Cache Hit Rate: ${metrics.cacheHitRate.toFixed(1)}%`)
      console.log(`🧠 Memory Usage: ${metrics.memoryUsage.toFixed(2)}MB`)
      console.groupEnd()
    }
  }

  // Reset all measurements
  reset(): void {
    this.marks.clear()
    this.cacheStats = { hits: 0, misses: 0 }
  }

  // Get Core Web Vitals if available
  getCoreWebVitals(): Promise<any> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(null)
        return
      }

      // Try to get CLS, FID, LCP using web-vitals library approach
      const vitals: any = {}

      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            vitals.lcp = lastEntry.startTime
          })
          observer.observe({ entryTypes: ['largest-contentful-paint'] })
        } catch (e) {
          // Fallback for browsers that don't support this
        }

        // First Input Delay
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach((entry: any) => {
              vitals.fid = entry.processingStart - entry.startTime
            })
          })
          observer.observe({ entryTypes: ['first-input'] })
        } catch (e) {
          // Fallback
        }
      }

      // Return what we have after a short delay
      setTimeout(() => resolve(vitals), 1000)
    })
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Convenience functions
export const startPerformanceMark = (name: string) =>
  performanceMonitor.startMark(name)
export const endPerformanceMark = (name: string) =>
  performanceMonitor.endMark(name)
export const logPerformanceMetrics = () => performanceMonitor.logMetrics()

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const startMark = (name: string) => performanceMonitor.startMark(name)
  const endMark = (name: string) => performanceMonitor.endMark(name)
  const getMetrics = () => performanceMonitor.getMetrics()
  const logMetrics = () => performanceMonitor.logMetrics()
  const recordCacheHit = () => performanceMonitor.recordCacheHit()
  const recordCacheMiss = () => performanceMonitor.recordCacheMiss()

  return {
    startMark,
    endMark,
    getMetrics,
    logMetrics,
    recordCacheHit,
    recordCacheMiss,
  }
}

// Utility to measure function execution time
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<{ result: T; duration: number }> {
  return new Promise(async (resolve, reject) => {
    try {
      performanceMonitor.startMark(name)
      const result = await fn()
      const duration = performanceMonitor.endMark(name) ?? 0
      resolve({ result, duration })
    } catch (error) {
      reject(error)
    }
  })
}

// Performance-aware delay function
export function performanceDelay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    // Use requestIdleCallback if available for better performance
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => {
        setTimeout(resolve, ms)
      })
    } else {
      setTimeout(resolve, ms)
    }
  })
}
