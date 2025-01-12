import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { v4 as uuid } from 'uuid'
import commonMiddleware from '../lib/commonMiddleware.js'
import httpJsonBodyParser from '@middy/http-json-body-parser'
import createError from 'http-errors'

const ddbClient = new DynamoDBClient({})

async function createAuction(event, context) {
    const title = event.body.title
    const now = new Date()
    const endDate = new Date()
    endDate.setHours(now.getHours() + 1)
    
    const auction = {
        id: { S: uuid() },
        title: { S: title },
        status: { S: 'OPEN' },
        createdAt: { S: now.toISOString() },
        endingAt: { S: endDate.toISOString()},
        highestBid: {
            M: {
                amount: { N: '0'}
            }
        }
    }

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction
    }

    try {
        const insertItem = await ddbClient.send(new PutItemCommand(params))
    } catch (error) {
        console.error("Error inserting item:", error)
        throw new createError.InternalServerError(error)
    }
    return {
        statusCode: 201,
        body: JSON.stringify(auction)
    }
}

export const handler = commonMiddleware(createAuction)
    .use(httpJsonBodyParser())