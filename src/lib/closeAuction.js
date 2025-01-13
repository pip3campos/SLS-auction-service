import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb'

const ddbClient = new DynamoDBClient({})

export async function closeAuction(auction) {
    if (!auction || !auction.id) {
        throw new Error('Auction ID is missing');
    }
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id: auction.id },
        UpdateExpression: 'SET #status = :status',
        ExpressionAttributeValues: {
            ':status': { S: 'CLOSED' }
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        }
    }
    const result = await ddbClient.send(new UpdateItemCommand(params))
    return result
}