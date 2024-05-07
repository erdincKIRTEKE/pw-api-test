import { request, expect } from "@playwright/test"
import user from './.auth/user.json'
import fs from 'fs'


 

async function globalSetup() {
    const authFile = '.auth/user.json'

    // we did not use request as a parameter so we have to create a context to use post or delete
    const context = await request.newContext()

    const responseToken = await context.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
            "user": { "email": "pwtesterd@test.com", "password": "Wellcome1" }

        },
        // global setup can not read from auth.setup.ts file so we have to add a header
        headers:{
            Authorization:`Token ${process.env.ACCESS_TOKEN}`
        }
    })

    const responseBody = await responseToken.json()

    const accessToken = responseBody.user.token

    user.origins[0].localStorage[0].value = accessToken

    fs.writeFileSync(authFile, JSON.stringify(user))

    process.env['ACCESS_TOKEN'] = accessToken

    const articleResponse = await context.post('https://conduit-api.bondaracademy.com/api/articles/', {
        data: {

            "article": { "title": "Global Likes  test title", "description": "This is a Global likes test descrption", "body": "This is a test body", "tagList": [] }
        },
        headers:{
            Authorization:`Token ${process.env.ACCESS_TOKEN}`
        }
    })

    expect(articleResponse.status()).toEqual(201)
    const response = await articleResponse.json()
    const slugId = response.article.slug
    process.env['SLUGID'] = slugId


}

export default  globalSetup;