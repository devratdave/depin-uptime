import express from "express";
import prismaClient from "db/client"
import { AuthMiddleware } from "./middlewares";
import cors from "cors";

const PORT = 8080
const app = express()

app.use(express.json())
app.use(cors())

app.get('/api/v1/websites', AuthMiddleware, async (req, res) => {
  const userId = req.UserId
  
  const data = await prismaClient.website.findMany({
    where: {
      userId,
      disabled: false
    },
    include: {
      ticks: true
    }
  })

  res.json(data)
})

app.get('/api/v1/website/status', AuthMiddleware, async (req, res) => {
  const websiteId = req.query.websiteId! as unknown as string
  const userId = req.UserId
  const data = await prismaClient.website.findFirst({
    where: {
      id: websiteId,
      userId,
      disabled: false
    },
    include: {
      ticks: true
    }
  })

  res.json(data)
})

app.post('/api/v1/website', AuthMiddleware, async (req, res) => {
  const userId = req.UserId!
  const url = req.body.url

  const data = await prismaClient.website.create({
    data: {
      userId,
      url
    }
  })

  res.json({
    id: data.id
  })
})

app.delete('/api/v1/website', AuthMiddleware, async (req, res) => {
  const websiteId = req.body.websiteId
  const userId = req.UserId!

  await prismaClient.website.update({
    where: {
      id: websiteId,
      userId
    }, 
    data: {
      disabled: true
    }
  })

  res.json({
    message: "Website deleted succesfully."
  })
})


app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
