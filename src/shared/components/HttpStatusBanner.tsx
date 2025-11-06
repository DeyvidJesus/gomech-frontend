import { useEffect, useMemo, useState } from 'react'

import {
  subscribeHttpStatusEvent,
  type HttpStatusEventDetail,
  type HttpStatusEventType,
} from '../services/httpEvents'

interface HttpBannerEvent extends HttpStatusEventDetail {
  type: HttpStatusEventType
}

const DISPLAY_DURATION_MS = 6000

export function HttpStatusBanner() {
  const [event, setEvent] = useState<HttpBannerEvent | null>(null)

  useEffect(() => {
    const unsubscribeUnauthorized = subscribeHttpStatusEvent('unauthorized', detail => {
      setEvent({ ...detail, type: 'unauthorized' })
    })
    const unsubscribeForbidden = subscribeHttpStatusEvent('forbidden', detail => {
      setEvent({ ...detail, type: 'forbidden' })
    })

    return () => {
      unsubscribeUnauthorized()
      unsubscribeForbidden()
    }
  }, [])

  useEffect(() => {
    if (!event) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setEvent(current => (current?.timestamp === event.timestamp ? null : current))
    }, DISPLAY_DURATION_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [event])

  const accentStyles = useMemo(() => {
    if (!event) {
      return 'bg-gray-900 text-white border-gray-700'
    }

    return event.type === 'unauthorized'
      ? 'bg-red-600 text-white border-red-700'
      : 'bg-amber-500 text-gray-900 border-amber-600'
  }, [event])

  if (!event) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-2 z-[1000] flex justify-center px-4">
      <div
        role="status"
        className={`pointer-events-auto flex max-w-3xl flex-1 items-start gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all ${accentStyles}`}
      >
        <span aria-hidden className="mt-1 text-lg">
          {event.type === 'unauthorized' ? '🔒' : '🚫'}
        </span>
        <div className="flex-1 text-sm">
          <p className="font-semibold">
            {event.type === 'unauthorized' ? 'Sessão expirada' : 'Acesso negado'}
          </p>
          <p className="mt-1 opacity-90">{event.message}</p>
        </div>
        <button
          type="button"
          onClick={() => setEvent(null)}
          className="rounded-md p-1 text-sm font-medium transition hover:bg-black/10"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}
