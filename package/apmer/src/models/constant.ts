export const CirclePoolEvents = {
  CREATE: 'CREATE',
  DISPOSE: 'DISPOSE',
} as const;

export type CirclePoolEvents =
  typeof CirclePoolEvents[keyof typeof CirclePoolEvents];
