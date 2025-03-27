export interface ValidateIncomingMessage {
  publicKey: string,
  signedMessage: string,
  callbackId: string,
  status: 'up' | 'down',
  latency: number,
  websiteId: string,
  validatorId: string
}

export interface ValidateOutgoingMessage {
  url: string
  callbackId: string
  websiteId: string
}

export interface SignupIncomingMessage {
  publicKey: string,
  signedMessage: string,
  callbackId: string,
  ip: string
}

export interface SignupOutgoingMessage {
  callbackId: string,
  validatorId: string
}


export type IncomingMessages = {
  type: 'validate',
  data: ValidateIncomingMessage
} | { 
  type: 'signup',
  data: SignupIncomingMessage
}

export type OutgoingMessages = {
  type: 'validate',
  data: ValidateOutgoingMessage
} | { 
  type: 'signup',
  data: SignupOutgoingMessage
}