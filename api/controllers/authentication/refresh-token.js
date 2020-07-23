module.exports = {


	friendlyName: 'Refresh Token',


	description: 'Creates a new Access Token and Refresh Token for a user, if the Refresh Token is still valid',


    inputs: {
        accessToken: {
            type: 'string',
            description: 'The old expired JWT access token',
            required: true
        },
        refreshToken: {
            type: 'string',
            description: 'The old JWT refresh token',
            required: true
        },
    },
    
    exits: sails.config.custom.responseTypes,

    fn: async function (inputs, exits) {
        // Initialize the request ID and the filename. These variables will be used for logging and tracing purposes
        const REQUEST_ID = this.req.headers.requestId;
        const FILE_PATH = __filename.split('controllers')[1];

        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Starting...`);

        let response = await sails.helpers.requestRouter.with(
            {
                url: this.req.url,
                body: inputs,
                headers: {requestId: this.req.headers.requestId},
                method: 'PUT',
                requestId: REQUEST_ID
            }
        );
        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Returning a response with status ${response.status}`);
        
        // If an error response is returned, return it to the user
        if(response && response.status !== "success") {
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: ${response.data}`);
            return exits[response.status](response);
        }
        
        // Delete the old access token from redis
        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Deleting from Redis the old Access Token: ${inputs.accessToken}`);

        let redisResponse = await sails.helpers.redisWrapper.with(
            {
                requestId: REQUEST_ID,
                dbNumber: 1,
                operation: 'delete',
                key: inputs.accessToken
            }
        )

        // If an error response is returned, return it to the user
        if(redisResponse && redisResponse.status !== "success") 
            return exits[redisResponse.status](redisResponse)

        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Successfully deleted the Access Token from Redis`);

        // save the access and refresh tokens in redis
        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Saving the new Access and Refresh tokens in Redis`);
        
        redisResponse = await sails.helpers.redisWrapper.with(
            {
                requestId: REQUEST_ID,
                dbNumber: 1,
                operation: 'set',
                key: response.data.accessToken,
                value: response.data.refreshToken
            }
        )

        // If an error response is returned, return it to the user
        if(redisResponse && redisResponse.status !== "success") 
            return exits[redisResponse.status](redisResponse);
        
        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Successfully saved the Access and Refresh tokens in Redis`);
        // based on the status of the response, return a response type to the client
        // response.status: success | logicalError | serverError | forbidden | unauthorized
        return exits[response.status](response);
    }
}