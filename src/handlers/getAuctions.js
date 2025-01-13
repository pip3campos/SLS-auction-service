import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'
import commonMiddleware from '../lib/commonMiddleware.js'
import createError from 'http-errors'
import validator from '@middy/validator'
import { transpileSchema } from "@middy/validator/transpile"
import getAuctionsSchema from '../lib/schemas/getAuctionsSchema.js'

const ddbClient = new DynamoDBClient({})

async function getAuctions(event, context) {
    const { status } = event.queryStringParameters || {}
    if (!status) {
        throw new createError.BadRequest('Status query parameter is required.');
    }
    let auctions = []
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeValues: {
            ':status': { S: status }
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        },
        ProjectionExpression: '#status, id'
    }

    try {
        const result = await ddbClient.send(new QueryCommand(params))
        if (Array.isArray(result.Items)) {
            auctions = result.Items;
        } else {
            console.log("No items found.");
        }
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
    .use(validator({
        eventSchema: transpileSchema(getAuctionsSchema),
        ajvOptions: {
            strict: false,
            useDefaults: true
        }
    }))