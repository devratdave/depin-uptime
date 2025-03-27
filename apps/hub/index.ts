import { randomUUIDv7, type ServerWebSocket } from "bun";
import PrismaClient from "db/client"
import { type OutgoingMessages, type IncomingMessages, type SignupIncomingMessage } from "common";
import { PublicKey } from "@solana/web3.js"
import nacl from "tweetnacl"
import nacl_utils from "tweetnacl-util"
import prismaClient from "db/client";

const availableValidators: { validatorId: string, publicKey: string, socket: ServerWebSocket<unknown> }[] = []

const CALLBACKS: { [callbackId: string]: (data: IncomingMessages) => void } = {}
const COST_PER_VALIDATION = 100

Bun.serve({
  fetch(req, server) {
    if(server.upgrade(req)) {
      return
    }
    return new Response("Not Found", { status: 404 })
  },
  port: 8081,
  websocket: {
    async message(ws: ServerWebSocket<unknown>, message: string) {
      const data: IncomingMessages = JSON.parse(message)

      if(data.type === "signup") {
        const verified = await verifyMessage(
          `Signed message for ${data.data.callbackId}, ${data.data.publicKey}`,
          data.data.publicKey, 
          data.data.signedMessage
        )

        if(verified) {
          await signupHandler(ws, data.data)
        }
    } else if (data.type === "validate") {

        CALLBACKS[data.data.callbackId](data)
        delete CALLBACKS[data.data.callbackId]
    }
  },
    async close(ws: ServerWebSocket) {
      availableValidators.splice(availableValidators.findIndex(v => v.socket === ws), 1)
    }
  }
})


async function verifyMessage(message: string, publicKey: string, signedMessage: string) {

  const messageBytes = nacl_utils.decodeUTF8(message)

  const verified = nacl.sign.detached.verify(messageBytes, new Uint8Array(JSON.parse(signedMessage)), new PublicKey(publicKey).toBytes())
  return verified
}


async function signupHandler(ws: ServerWebSocket<unknown>, {ip, callbackId, publicKey, signedMessage}: SignupIncomingMessage) {
  const validatorInDB = await PrismaClient.validator.findFirst({
    where: {
      publicKey: publicKey
    }
  })

  if(validatorInDB) {
    ws.send(JSON.stringify({
      type: "signup",
      data: {
        callbackId,
        validatorId: validatorInDB.id
      }
    }))

    availableValidators.push({
      validatorId: validatorInDB.id,
      publicKey: validatorInDB.publicKey,
      socket: ws
    })
    return;
  }

  const ipInfo = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEO_API_KEY}&ip=${ip}`)
  const ipInfoJson = await ipInfo.json() as {
    city: string,
    country_name: string,
    state_prov: string
  }

  const validatorNew = await PrismaClient.validator.create({
    data: {
      publicKey,
      ip,
      location: ipInfoJson.city + ", " + ipInfoJson.state_prov + " " + ipInfoJson.country_name
    }
  })

  ws.send(JSON.stringify({
    type: "signup",
    data: {
      callbackId,
      validatorId: validatorNew.id
    }
  }))

  availableValidators.push({
    validatorId: validatorNew.id,
    publicKey: publicKey,
    socket: ws 
  })
}

setInterval(async () => {

  const websitesToMonitor = await PrismaClient.website.findMany({
    where: {
      disabled: false
    }
  })

  for (const website of websitesToMonitor) {
    availableValidators.forEach(validator => {
      const callbackId = randomUUIDv7()
      console.log(`Validating ${website.url} with validator ${validator.validatorId}`)

      validator.socket.send(JSON.stringify({
        type: "validate",
        data: {
          url: website.url,
          callbackId,
          websiteId: website.id
        }
      }))

      CALLBACKS[callbackId] = async (data: IncomingMessages) => {
        if(data.type === "validate") {
          const { signedMessage, status, latency, validatorId } = data.data

          const verified = await verifyMessage(
            `Replying ${callbackId}`,
            validator.publicKey,
            signedMessage
          )

          if(!verified) {
            return;
        }

          await prismaClient.$transaction(async (tx) => {

            await tx.websiteTick.create({
              data: {
                status, latency, websiteId: website.id, validatorId, createdAt: new Date()
              }
            })
          
          await tx.validator.update({
            where: {
              id: validatorId
            },
            data: {
              pendingPayouts: {
                increment: COST_PER_VALIDATION
              }
            }})
        })
      }
    }
  })}
}, 60 * 1000)