export type HttpStatusEventType = 'unauthorized' | 'forbidden'

export interface HttpStatusEventDetail {
  status: number
  message?: string
  timestamp: number
}

type HttpStatusListener = (detail: HttpStatusEventDetail) => void

const listeners: Record<HttpStatusEventType, Set<HttpStatusListener>> = {
  unauthorized: new Set(),
  forbidden: new Set(),
}

export function emitHttpStatusEvent(type: HttpStatusEventType, detail: Omit<HttpStatusEventDetail, 'timestamp'>) {
  const payload: HttpStatusEventDetail = { ...detail, timestamp: Date.now() }

  for (const listener of listeners[type]) {
    try {
      listener(payload)
    } catch (error) {
      console.error('Erro ao notificar listener HTTP', error)
    }
  }
}

export function subscribeHttpStatusEvent(type: HttpStatusEventType, listener: HttpStatusListener) {
  listeners[type].add(listener)
  return () => {
    listeners[type].delete(listener)
  }
}
