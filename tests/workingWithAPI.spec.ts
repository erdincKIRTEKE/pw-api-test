import { test, expect, request } from '@playwright/test';
import tags from "../test-data/tags.json"



test.beforeEach(async ({ page }) => {
  //mocking API
  await page.route('*/**/api/tags', async route => {

    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })


  await page.goto('https://conduit.bondaracademy.com/')

})

test('has title', async ({ page }) => {


  // modifying api response
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = 'This a MODIFIED test title'
    responseBody.articles[0].description = 'This is a MODIFIED description'

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })

  })

  await page.getByText('Global Feed').click()
  await expect(page.locator('.navbar-brand')).toHaveText('conduit')
  await expect(page.locator('app-article-list h1').first()).toContainText('This a MODIFIED test title')
  await expect(page.locator('app-article-list p').first()).toContainText('This is a MODIFIED description')

  //if we test only conduit text we have to add wait since page is closed faster than assertion. 
  //also we have to add wait for see modified tags. When we use assertions playwright has enough time for testing title
 // await page.waitForTimeout(1000)



})

test('deleting article', async ({ page, request }) => {
  // const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
  //   //all other frameworks request payload called request body however playwright calls data
  //   data: {
  //     "user": { "email": "pwtesterd@test.com", "password": "Wellcome1" }

  //   }
  // })

  // const responseBody = await response.json()

  // const accessToken = responseBody.user.token
  //const accessToken = user.origins[0].localStorage[0].value


  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {

      "article": { "title": "This is a test title", "description": "This is a test descrption", "body": "This is a test body", "tagList": [] }
    },
    // headers: {
    //   Authorization: `Token ${accessToken}`
   // }
  })

  // expect(articleResponse.status()).toEqual(201)

  
  // const articleResponseBody= await articleResponse.json()

  // const slugId=articleResponseBody.article.slug


  // const deleteResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
  //   headers: {
  //     Authorization: `Token ${accessToken}`
  //   }

  // })

  // expect(deleteResponse.status()).toEqual(204)

  await page.getByText('Global Feed').click()

  await page.getByText('This is a test title').click()
  await page.getByRole('button',{name:'Delete Article'}).first().click()



  await page.getByText('Global Feed').click()


  await expect(page.locator('app-article-list h1').first()).not.toContainText('This a test title')
  await expect(page.locator('app-article-list p').first()).not.toContainText('This is a description')


})


test('create an article by ui and delete the article by API request',async({page,request})=>{

  // const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
  //   //all other frameworks request payload called request body however playwright calls data
  //   data: {
  //     "user": { "email": "pwtesterd@test.com", "password": "Wellcome1" }

  //   }
  // })

  // const responseBody = await response.json()

  // const accessToken = responseBody.user.token

  //const accessToken = user.origins[0].localStorage[0].value

  await page.getByText('New Article').click()

  await page.getByRole('textbox',{name:'Article Title'}).fill('Playwright is perfect')
  await page.getByRole('textbox',{name:'What\'s this article about?'}).fill('Playwright')
  await page.getByRole('textbox',{name:'Write your article (in markdown)'}).fill('Playwright is a test automation')
  await page.getByRole('button',{name:'Publish Article'}).click()

 const articleResponse= await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')

 const articleResponseBody=  await articleResponse.json()



 const slugId= articleResponseBody.article.slug

 const deleteArticleResponse=await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`,{
  // headers: {
  //      Authorization: `Token ${accessToken}`
  //   }
  
 })

 await page.getByText('conduit').first().click()
 await expect(page.locator('.preview-link h1').first()).not.toContainText('Playwright is perfect')
 await expect(page.locator('.preview-link p').first()).not.toContainText('Playwright')


 expect(deleteArticleResponse.status()).toEqual(204)

})


