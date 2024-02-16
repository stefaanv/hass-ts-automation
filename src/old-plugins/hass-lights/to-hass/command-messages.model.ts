export interface CommandResultMsg {
  type: 'result'
  id: number
  success: boolean
  result: any
  error: any
}

export interface CommandContext {
  id: string
  parent_id: string | null
  user_id: string | null
}
