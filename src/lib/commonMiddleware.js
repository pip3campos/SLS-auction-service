import middy from '@middy/core'
import httpEventNormalizer from '@middy/http-event-normalizer'
import httpErrorHandler from '@middy/http-error-handler'

export default handler => middy({timeoutEarlyInMillis:0})
    .use([httpEventNormalizer(), httpErrorHandler()])
    .handler(handler)