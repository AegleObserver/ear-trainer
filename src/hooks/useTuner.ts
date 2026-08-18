import { useCallback, useEffect, useRef, useState } from 'react'
import { readPitch, startTuner, stopTuner, type PitchReading } from '../audio/tuner'

export interface UseTunerResult {
  listening: boolean
  reading: PitchReading | null
  error: string | null
  start: () => Promise<void>
  stop: () => void
}

function errorMessage(err: unknown): string {
  const name = err instanceof Error ? err.name : ''
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return '麦克风权限被拒绝，请在浏览器设置中允许后重试'
  }
  if (name === 'NotReadableError' || name === 'AbortError') {
    return '麦克风被其他程序占用或不可用，请检查设备'
  }
  if (err instanceof Error && err.message) return err.message
  return '无法启动麦克风，请检查设备与 HTTPS 环境'
}

export function useTuner(active: boolean): UseTunerResult {
  const [listening, setListening] = useState(false)
  const [reading, setReading] = useState<PitchReading | null>(null)
  const [error, setError] = useState<string | null>(null)
  const rafRef = useRef<number | null>(null)

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    stopTuner()
    setListening(false)
    setReading(null)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    try {
      await startTuner()
      setListening(true)
      const loop = () => {
        const pitch = readPitch()
        setReading(pitch)
        rafRef.current = requestAnimationFrame(loop)
      }
      rafRef.current = requestAnimationFrame(loop)
    } catch (err) {
      setError(errorMessage(err))
      setListening(false)
      setReading(null)
    }
  }, [])

  useEffect(() => {
    if (!active) stop()
  }, [active, stop])

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      stopTuner()
    }
  }, [])

  return { listening, reading, error, start, stop }
}
