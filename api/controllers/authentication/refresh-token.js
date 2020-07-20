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
        // based on the status of the response, return a response type to the client
        // response.status: success | logicalError | serverError | forbidden | unauthorized
        return exits[response.status](response);
    }
}