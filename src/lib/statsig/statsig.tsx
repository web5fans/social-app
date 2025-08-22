import type React from 'react'

import {type MetricEvents} from '#/logger/metrics'
import {type Gate} from './gates'

export type {MetricEvents as LogEvents}

export function toClout(n: number | null | undefined): number | undefined {
  if (n == null) {
    return undefined
  } else {
    return Math.max(0, Math.round(Math.log(n)))
  }
}

/**
 * @deprecated use `logger.metric()` instead
 */
export function logEvent(..._args: any[]) {}

type GateOptions = {
  dangerouslyDisableExposureLogging?: boolean
}

export function useGate(): (gateName: Gate, options?: GateOptions) => boolean {
  return (_gateName: Gate, _options: GateOptions = {}): boolean => true
}

export async function tryFetchGates(..._args: any[]) {}

export function Provider({children}: {children: React.ReactNode}) {
  return children
}
