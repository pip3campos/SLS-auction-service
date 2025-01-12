import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'

const ddbClient = new DynamoDBClient({})

export async function getEndedAuctions() {
    const now = new Date()
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status = :status AND endingAt <= :now',
        ExpressionAttributeValues: {
            ':status': { S: 'OPEN' },
            ':now': { S: now.toISOString() }
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        },
        ProjectionExpression: '#status, id, endingAt'
    }

    try {
        const response = await ddbClient.send(new QueryCommand(params))
        console.log('DynamoDB Response:', response)
        return Array.isArray(response.Items) ? response.Items : []
    } catch (error) {
        console.error('Error fetching auctions:', error)
        throw new Error('Error fetching auctions')
    }
}