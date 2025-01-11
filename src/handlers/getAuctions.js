import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'
import commonMiddleware from '../lib/commonMiddleware.js'
import createError from 'http-errors'

const ddbClient = new DynamoDBClient({})

async function getAuctions(event, context) {
    let auctions
    try {
        const result = await ddbClient.send(new ScanCommand({ TableName: process.env.AUCTIONS_TABLE_NAME }))
        auctions = result.Items
    } catch (error) {
        console.error("Error getting items:", error)
        throw new createError.InternalServerError(error)
    }
    return {
        statusCode: 200,
        body: JSON.stringify(auctions)
    }
}

export const handler = commonMiddleware(getAuctions)