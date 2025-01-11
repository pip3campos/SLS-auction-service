import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import commonMiddleware from '../lib/commonMiddleware.js'
import createError from 'http-errors'

const ddbClient = new DynamoDBClient({})

async function getAuction(event, context) {
    let auction
    const id = event.pathParameters.id
    console.log("Requesting auction with ID:", id);
    
    try {
        const result = await ddbClient.send(new GetItemCommand({
            TableName: process.env.AUCTIONS_TABLE_NAME,
            Key: { id: { S: id } }
        }))
        auction = result.Item
    } catch (error) {
        console.error("Error getting items:", error)
        throw new createError.InternalServerError(error)
    }
    if (!auction) {
        throw new createError.NotFound(`Auction with ID "${id}" not found!`)
    }
    return {
        statusCode: 200,
        body: JSON.stringify(auction)
    }
}

export const handler = commonMiddleware(getAuction)