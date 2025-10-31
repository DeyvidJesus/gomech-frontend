import type { ReportCallback } from 'web-vitals'

const reportWebVitals = (onPerfEntry?: ReportCallback) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals').then(({ onCLS, onFID, onLCP, onINP, onFCP, onTTFB }) => {
      onCLS(onPerfEntry)
      onFID(onPerfEntry)
      onLCP(onPerfEntry)
      onINP(onPerfEntry)
      onFCP(onPerfEntry)
      onTTFB(onPerfEntry)
    })
  }
}

export default reportWebVitals
