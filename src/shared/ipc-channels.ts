export const IPC = {
  GET_STATE: 'state:get',
  SAVE_PROFILE: 'profiles:save',
  DELETE_PROFILE: 'profiles:delete',
  SET_ACTIVE: 'profiles:setActive',
  EXPORT_PROFILE: 'profiles:export',
  IMPORT_PROFILE: 'profiles:import',
  STORE_ERROR: 'store:error'
} as const
