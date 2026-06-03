import { Component, type ReactNode } from 'react'

// 同期描画エラー専任。非同期 Promise rejection は main.tsx の
// unhandledrejection ハンドラ + store 内 toast 側で扱う。
interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }): void {
    console.error('[ErrorBoundary]', error, info)
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="h-full w-full overflow-auto bg-red-950 text-red-100 p-6 font-mono text-sm">
          <h1 className="text-lg font-bold mb-2">レンダリングエラー</h1>
          <pre className="whitespace-pre-wrap break-words">
            {this.state.error.name}: {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack ?? ''}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-4 px-3 py-1 rounded bg-white text-red-700 font-bold"
          >
            再描画を試みる
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
