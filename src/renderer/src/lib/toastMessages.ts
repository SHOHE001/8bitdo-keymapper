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
  confirmDeleteProfile: (name: string) => `プロファイル「${name}」を削除しますか？`
}
