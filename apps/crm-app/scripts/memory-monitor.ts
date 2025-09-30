// Memory Usage Monitor
function getMemoryUsage() {
  const usage = process.memoryUsage()
  return {
    rss: Math.round(usage.rss / 1024 / 1024), // Resident Set Size in MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // Total heap size in MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // Used heap size in MB
    external: Math.round(usage.external / 1024 / 1024), // External memory in MB
    timestamp: new Date().toISOString(),
  }
}

async function monitorMemory(
  duration: number = 60000,
  interval: number = 5000
) {
  console.log('🔍 Starting Memory Usage Monitoring...\n')

  const measurements: any[] = []
  const startTime = Date.now()

  console.log('Time\t\tRSS(MB)\tHeap Total(MB)\tHeap Used(MB)\tExternal(MB)')
  console.log('─'.repeat(80))

  const intervalId = setInterval(() => {
    const usage = getMemoryUsage()
    measurements.push(usage)

    console.log(
      `${usage.timestamp.split('T')[1].split('.')[0]}\t${usage.rss}\t${usage.heapTotal}\t\t${usage.heapUsed}\t\t${usage.external}`
    )

    if (Date.now() - startTime >= duration) {
      clearInterval(intervalId)

      // Calculate statistics
      const rssValues = measurements.map((m) => m.rss)
      const heapUsedValues = measurements.map((m) => m.heapUsed)

      const avgRss = Math.round(
        rssValues.reduce((a, b) => a + b) / rssValues.length
      )
      const maxRss = Math.max(...rssValues)
      const minRss = Math.min(...rssValues)

      const avgHeap = Math.round(
        heapUsedValues.reduce((a, b) => a + b) / heapUsedValues.length
      )
      const maxHeap = Math.max(...heapUsedValues)
      const minHeap = Math.min(...heapUsedValues)

      console.log('\n📊 Memory Usage Statistics:')
      console.log(
        `  RSS Memory: Min: ${minRss}MB, Max: ${maxRss}MB, Avg: ${avgRss}MB`
      )
      console.log(
        `  Heap Memory: Min: ${minHeap}MB, Max: ${maxHeap}MB, Avg: ${avgHeap}MB`
      )

      // Memory leak detection
      const memoryGrowth = maxRss - minRss
      console.log(`  Memory Growth: ${memoryGrowth}MB`)

      if (memoryGrowth > 50) {
        console.log('🔴 WARNING: Potential memory leak detected!')
      } else if (memoryGrowth > 20) {
        console.log('🟡 CAUTION: Moderate memory growth observed')
      } else {
        console.log('🟢 GOOD: Memory usage is stable')
      }

      // Performance assessment
      if (avgRss < 100) {
        console.log('🟢 EXCELLENT: Low memory footprint')
      } else if (avgRss < 200) {
        console.log('🟡 GOOD: Moderate memory usage')
      } else {
        console.log('🔴 HIGH: High memory consumption')
      }
    }
  }, interval)
}

// Start monitoring
monitorMemory(30000, 3000) // Monitor for 30 seconds, check every 3 seconds
