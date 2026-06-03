import { useCallback, useEffect, useRef, useState } from 'react'

// keydown キャプチャを開始し、押されたキーの code をコールバックに渡す。
// 前のキャプチャ中に start を呼び直す、あるいは unmount したときは必ず
// keydown リスナーを外す。タブ切り替えで残り続けてメモリリーク・誤発火する問題を防ぐ。
export function useKeyCapture(): {
  capturing: boolean
  start: (onCapture: (code: string) => void) => void
} {
  const [capturing, setCapturing] = useState(false)
  const handlerRef = useRef<((e: KeyboardEvent) => void) | null>(null)

  const detach = useCallback((): void => {
    if (handlerRef.current) {
      window.removeEventListener('keydown', handlerRef.current)
      handlerRef.current = null
    }
  }, [])

  const start = useCallback(
    (onCapture: (code: string) => void): void => {
      detach()
      setCapturing(true)
      const handler = (e: KeyboardEvent): void => {
        e.preventDefault()
        onCapture(e.code)
        setCapturing(false)
        detach()
      }
      handlerRef.current = handler
      window.addEventListener('keydown', handler)
    },
    [detach]
  )

  useEffect(() => {
    return () => detach()
  }, [detach])

  return { capturing, start }
}
