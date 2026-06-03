// physical key の `code` プロパティ（KeyA, Digit1, Numpad1, ArrowLeft 等）から
// ユーザー向けの短いラベルへ整形する純粋関数。kind/UI に依存しないので shared 配下。
//
// 注: 今は Key/Digit プレフィックスのみ剥がす。Numpad / Arrow / F* 等を
// 将来追加するときも、ここを増やすだけで対応できる。
const STRIPPABLE_PREFIXES = ['Key', 'Digit'] as const

export function prettyKeyCode(code: string): string {
  for (const prefix of STRIPPABLE_PREFIXES) {
    if (code.startsWith(prefix) && code.length > prefix.length) {
      return code.slice(prefix.length)
    }
  }
  return code
}
