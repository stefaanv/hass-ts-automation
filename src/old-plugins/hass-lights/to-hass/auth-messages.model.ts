interface AuthRequestMsg {
  type: 'auth_required'
  ha_version: string
}

interface AuthApprovalMsg {
  type: 'auth_ok'
  ha_version: string
}

interface AuthFailedMsg {
  type: 'auth_invalid'
  message: string
}

interface AuthRequest {
  type: 'auth'
  access_token: string
}
