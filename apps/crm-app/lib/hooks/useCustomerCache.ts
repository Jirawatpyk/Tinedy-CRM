'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Customer } from '@prisma/client'
import { usePerformanceMonitor } from '@/lib/utils/performance'

interface CustomerApiResponse {
  customers: Customer[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  filters: {
    query: string | null
    status: string | null
    sortBy: string
    sortOrder: string
  }
}

interface CacheEntry {
  data: CustomerApiResponse
  timestamp: number
  expiresAt: number
}

interface SearchParams {
  q?: string
  status?: string
  page?: string
  limit?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Memory cache with LRU eviction
class CustomerCache {
  private cache = new Map<string, CacheEntry>()
  private maxSize = 50 // Maximum cache entries
  private defaultTTL = 300000 // 5 minutes in milliseconds

  private generateKey(params: SearchParams): string {
    const normalizedParams = {
      q: params.q || '',
      status: params.status || '',
      page: params.page || '1',
      limit: params.limit || '10',
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc',
    }
    return JSON.stringify(normalizedParams)
  }

  get(params: SearchParams): CustomerApiResponse | null {
    const key = this.generateKey(params)
    const entry = this.cache.get(key)

    if (!entry) return null

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    // Move to end (LRU)
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.data
  }

  set(
    params: SearchParams,
    data: CustomerApiResponse,
    ttl = this.defaultTTL
  ): void {
    const key = this.generateKey(params)
    const timestamp = Date.now()
    const expiresAt = timestamp + ttl

    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp,
      expiresAt,
    })
  }

  invalidate(patterns?: string[]): void {
    if (!patterns || patterns.length === 0) {
      this.cache.clear()
      return
    }

    Array.from(this.cache.keys()).forEach((key) => {
      if (patterns.some((pattern) => key.includes(pattern))) {
        this.cache.delete(key)
      }
    })
  }

  prefetch(paramsList: SearchParams[]): void {
    // Mark parameters for prefetching
    paramsList.forEach((params) => {
      const key = this.generateKey(params)
      if (!this.cache.has(key)) {
        // You could implement actual prefetching here
        console.log(`Prefetch candidate: ${key}`)
      }
    })
  }
}

// Global cache instance
const customerCache = new CustomerCache()

export function useCustomerCache() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController>()
  const { startMark, endMark, recordCacheHit, recordCacheMiss, logMetrics } =
    usePerformanceMonitor()

  const fetchCustomers = useCallback(
    async (
      params: SearchParams,
      options: {
        useCache?: boolean
        cacheTTL?: number
        force?: boolean
      } = {}
    ): Promise<CustomerApiResponse | null> => {
      const { useCache = true, cacheTTL, force = false } = options

      // Check cache first (unless force refresh)
      if (useCache && !force) {
        const cached = customerCache.get(params)
        if (cached) {
          recordCacheHit()
          return cached
        } else {
          recordCacheMiss()
        }
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        setLoading(true)
        setError(null)

        // Start performance monitoring
        const isSearch = params.q && params.q.length > 0
        const markName = isSearch ? 'customerSearch' : 'customerListLoad'
        startMark(markName)

        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.set(key, value)
        })

        const response = await fetch(
          `/api/customers?${searchParams.toString()}`,
          {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache', // Let our custom cache handle it
            },
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: CustomerApiResponse = await response.json()

        // End performance monitoring
        endMark(markName)

        // Cache the result
        if (useCache) {
          customerCache.set(params, data, cacheTTL)
        }

        // Log metrics in development
        if (process.env.NODE_ENV === 'development') {
          setTimeout(() => logMetrics(), 100)
        }

        return data
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return null // Request was cancelled
        }

        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        setError(errorMessage)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [startMark, endMark, recordCacheHit, recordCacheMiss, logMetrics]
  )

  const invalidateCache = useCallback((patterns?: string[]) => {
    customerCache.invalidate(patterns)
  }, [])

  const prefetchCustomers = useCallback((paramsList: SearchParams[]) => {
    customerCache.prefetch(paramsList)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    fetchCustomers,
    invalidateCache,
    prefetchCustomers,
    loading,
    error,
    cache: customerCache, // Expose cache for debugging
  }
}
