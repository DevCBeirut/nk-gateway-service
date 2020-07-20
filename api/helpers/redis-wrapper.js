module.exports = {

	friendlyName: 'Create JWT Tokens',


    description: 'A generic function that performs a query on the Arango Database, and returns a result',
    

    inputs : {
        dbNumber: {
            type: 'number',
            required: true,
            description: 'The number of the Redis database that will be used'
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
        const { promisify } = require('util');
        const redis = require('redis');

        try {
            // Add the database number to the redis credentials object.
            //Redis will connect to the database as soon as it connects to the server
            let redisInfo = sails.config.custom.credentials;
            redisInfo.credentials.db = input.dbNumber;

            sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Creating a Redis connection to database number ${inputs.dbNumber}`);
            
            const redisClient = redis.createClient(redisInfo.credentials, {
                retry_strategy: (options) => {
                    
                    if (options.error) {
                        sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Attempt ${options.attempt}/${redisInfo.config.maxAttempts} Error while connecting to the redis server`);
                        sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: ${error}`);
                    }
                    if (options.attempt > redisInfo.config.maxAttempts) {
                        sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Exceeded the maximum number of attempts (${redisInfo.config.maxAttempts}). Exiting...`);
                        throw new Error
                    }
                    // reconnect after 250 ms
                    return redisInfo.config.retryDelay;
                },
            });

            sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Successfully created a Redis connection to database number ${inputs.dbNumber}`);
            console.log(redisClient)

        } catch (error) {
            sails.log.error(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Redis server error:`);
            sails.log.error(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: ${error}`);
            return exits.success({
                status: 'error',
                data: {
                    errorCode: 500,
                    message: "ArangoDB server error while executing the query"
                }
            });
        }
    }
}



