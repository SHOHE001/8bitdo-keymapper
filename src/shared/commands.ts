import type { Profile } from './types'

export type Command =
  | { type: 'profiles/save'; profile: Profile }
  | { type: 'profiles/delete'; id: string }
  | { type: 'profiles/setActive'; id: string | null }
  | { type: 'ui/setWelcomeSeen'; value: boolean }

export type CommandType = Command['type']
