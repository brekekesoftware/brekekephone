import type { UcChatClient, UcConstants, UcErrors, UcLogger } from '.'

// need to set = null to fix issue with babel cli build
// this will not have any effect since we are in .d.ts
export const ChatClient: UcChatClient = null
export const Logger: UcLogger = null
export const Constants: UcConstants = null
export const Errors: UcErrors = null
