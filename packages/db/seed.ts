import prismaClient from "./src";

async function seed() {

    const user = await prismaClient.user.create({
      data: {
        id: "5",
        email: "sample1@test.com"
      }
    })

    const website_1 = await prismaClient.website.create({
      data: {
        url: "https://www.youtube.com",
        userId: user.id
      }
    })

    const website_2 = await prismaClient.website.create({
      data: {
        url: "https://www.instagram.com",
        userId: user.id
      }
    })

    const validator = await prismaClient.validator.create({
      data: {
        ip: "127.0.0.1",
        location: "New Delhi",
        publicKey: "83043208620"
      }
    })

    await prismaClient.websiteTick.create({
      data: {
        websiteId: website_1.id,
        validatorId: validator.id,
        createdAt: new Date(),
        status: "up",
        latency: 100
      }
    })

    await prismaClient.websiteTick.create({
      data: {
        websiteId: website_1.id,
        validatorId: validator.id,
        createdAt: new Date(Date.now() - 1000 * 60 * 10),
        status: "down",
        latency: 100
      }
    })

    await prismaClient.websiteTick.create({
      data: {
        websiteId: website_1.id,
        validatorId: validator.id,
        createdAt: new Date(Date.now() - 1000 * 60 * 20),
        status: "up",
        latency: 100
      }
    })
}

seed()
