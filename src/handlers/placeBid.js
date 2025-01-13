import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import commonMiddleware from '../lib/commonMiddleware.js'
import httpJsonBodyParser from '@middy/http-json-body-parser'
import createError from 'http-errors'
import { getAuctionById } from './getAuction.js'
import validator from '@middy/validator'
import { transpileSchema } from '@middy/validator/transpile'
import placeBidSchema from '../lib/schemas/placeBidSchema.js'

const ddbClient = new DynamoDBClient({})

async function placeBid(event, context) {
    const id = event.pathParameters.id
    const { amount } = event.body
    const auction = await getAuctionById(id)
    if (auction.status.S !== 'OPEN') {
        throw new createError.Forbidden('You cannot bid on closed auctions!')
    }
    if (Number(amount) <= Number(auction.highestBid.M.amount.N)) {
        throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.M.amount.N}!`)
    }
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: {
            id: {
                S: id
            }
        },
        UpdateExpression: 'SET highestBid.amount = :a',
        ExpressionAttributeValues: {
            ':a': {
                'N': String(amount)
            }
        },
        ReturnValues: 'UPDATED_NEW'
    }
    console.log("Placing bid on auction with ID:", id);
    
    let updatedAuction

    try {
        const result = await ddbClient.send(new UpdateItemCommand(params))
        updatedAuction = result.Attributes
    } catch (error) {
        console.error("Error placing bid:", error)
        throw new createError.InternalServerError(error)
    }
    if (!updatedAuction) {
        throw new createError.NotFound(`Auction with ID "${id}" not found!`)
    }
    return {
        statusCode: 200,
        body: JSON.stringify(updatedAuction)
    }
}

export const handler = commonMiddleware(placeBid)
    .use(httpJsonBodyParser())
    .use(validator({
        eventSchema: transpileSchema(placeBidSchema),
        ajvOptions: {
            strict: true
        }
    }))