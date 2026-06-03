// 当面は ja のみ。将来 i18n 化する際は、本ファイルと WelcomeOverlay / PresetMenu のハードコード文言を
// 共通辞書に寄せる方針で進める。
export const toastMessages = {
  profileCreated: (name: string) => `プロファイル「${name}」を作成しました`,
  profileDeleted: (name: string) => `プロファイル「${name}」を削除しました`,
  profileImported: (name: string) => `プロファイル「${name}」を読み込みました`,
  profileExported: () => 'プロファイルを書き出しました',
  presetApplied: (name: string) => `プリセット「${name}」を適用しました`,
  sampleCreated: (name: string) => `サンプルプロファイル「${name}」を作成しました`,
  themeChanged: (label: string) => `テーマを「${label}」に変更しました`,
  needProfileFirst: () => '先にプロファイルを作成してください',
  profileNameRequired: () => 'プロファイル名を入力してください',
  confirmDeleteProfile: (name: string) => `プロファイル「${name}」を削除しますか？`,

  // 失敗系
  saveProfileFailed: () => 'プロファイルの保存に失敗しました',
  deleteProfileFailed: () => 'プロファイルの削除に失敗しました',
  setActiveFailed: () => 'プロファイル切替に失敗しました',
  importFailed: () => 'プロファイルの読み込みに失敗しました',
  exportFailed: () => 'プロファイルの書き出しに失敗しました',
  clipboardFailed: () => 'クリップボードへの書き込みに失敗しました',
  stateLoadFailed: () => '設定の読み込みに失敗しました',
  unexpectedError: () => '予期しないエラーが発生しました'
}
