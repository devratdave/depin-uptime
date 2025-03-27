import { type OutgoingMessages, type SignupOutgoingMessage, type ValidateOutgoingMessage } from "common"
import { randomUUIDv7, type ServerWebSocket } from "bun"
import { Keypair } from "@solana/web3.js"
import nacl from "tweetnacl"
import nacl_utils from "tweetnacl-util"

const CALLBACKS: { [callbackId: string]: (data: SignupOutgoingMessage) => void } = {}
let validatorId: string | null = null

async function main() {
  const keypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(process.env.VALIDATOR_SECRET_KEY!))
  )

  const ws = new WebSocket("ws://localhost:8081")

  ws.onmessage = async (event) => {
    const data: OutgoingMessages = JSON.parse(event.data)

    if(data.type == "signup") {
      CALLBACKS[data.data.callbackId](data.data)
      delete CALLBACKS[data.data.callbackId]
    } else if(data.type == "validate") {

        await validateHandler(ws, data.data, keypair)
    }
  }

  ws.onopen = async () => {
    const callbackId = randomUUIDv7()

    CALLBACKS[callbackId] = (data: SignupOutgoingMessage) => {
      validatorId = data.validatorId
  }

    const signedMessage = await signMessage(`Signed message for ${callbackId}, ${keypair.publicKey}`, keypair)

    ws.send(JSON.stringify({
      type: "signup",
      data: {
        signedMessage,
        callbackId,
        publicKey: keypair.publicKey,
        ip: "172.217.22.14"
      }
    }))
}
}


async function validateHandler(ws: WebSocket, { url, callbackId, websiteId }: ValidateOutgoingMessage, keypair: Keypair) {
  console.log(`Validating ${url}`)

  const startTime = Date.now()
  const signature = await signMessage(`Replying ${callbackId}`, keypair)

  try {
    const response = await fetch(url)
    const endTime = Date.now()
    const status = response.status
    const latency = endTime - startTime

    ws.send(JSON.stringify({
      type: "validate",
      data: {
        status: status === 200 ? 'up' : 'down',
        callbackId, 
        latency,
        validatorId,
        signedMessage: signature,
        websiteId
    }
  })
)
  } catch (error) {
      ws.send(JSON.stringify({
        type: "validate",
        data: {
          status: 'down',
          callbackId, 
          latency: 1000,
          validatorId,
          signedMessage: signature,
          websiteId
      }
  })
)
      console.error(`Error validating ${url}: ${error}`)
  }
}


async function signMessage(message: string, keypair: Keypair) {
  const messageBytes = nacl_utils.decodeUTF8(message)
  const signed = nacl.sign.detached(messageBytes, keypair.secretKey)
  return JSON.stringify(Array.from(signed))
}

main()

setInterval(() => {
}, 10 * 1000)