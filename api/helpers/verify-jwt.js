module.exports = {

	friendlyName: 'Verify JWT Token',


    description: 'Verifies a JWT token',
    

    inputs : {
        accessToken: {
			type: 'string',
			required: true,
			description: 'The JWT Access Token'
        },
        requestId: {
			type: 'string',
			required: true,
			description: 'The ID of the incoming request. The request ID is used for tracing purposes'
        }
    },

    exits: {},

    fn: async function (inputs, exits) {
        // Initialize the filename. This variable will be used for logging purposes 
        const FILE_PATH = __filename.split('helpers')[1];
        const jwt = require("jsonwebtoken");

        // Create a JWT access Token
        sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Fetching the Access and Refresh Tokens from Redis`);
        
        let redisResponse = await sails.helpers.redisWrapper.with(
            {
                requestId: inputs.requestId,
                dbNumber: 1,
                operation: 'get',
                key: inputs.accessToken
            }
        )       

        // If the tokens are not found in redis, return a forbidden response
        if(redisResponse && !redisResponse.data) {
            sails.log.info(`Controller ${FILE_PATH} -- Request ID ${inputs.requestId}: Unable to find the tokens in Redis. Exiting`);
            return exits.success({status: "forbidden", data: "Missing or invalid token"});
        }

        // If there is a logical or server error, break out
        if(redisResponse && (redisResponse.status === "serverError" || redisResponse.status === "logicalError")) 
            return exits.success(redisResponse);

        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${inputs.requestId}: verifying the JWT Access Token: ${inputs.accessToken}`);
        
        let userInfo;
        try {
            userInfo = await jwt.verify(inputs.accessToken, sails.config.custom.jwt.secret);
        } catch (error) {
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${inputs.requestId}: Invalid Access Token: ${inputs.accessToken}`);
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${inputs.requestId}: ${error.name} | ${error.message}`);
            return exits.success({status: "forbidden", data: "Missing or invalid token"});
            // TODO handle different kinds of errors more properly
        }

        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${inputs.requestId}: The JWT token is valid`);
        return exits.success({status: "success", data: userInfo.data});
        
    }
}



