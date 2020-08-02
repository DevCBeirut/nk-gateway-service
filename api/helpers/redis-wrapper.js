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
        },
        operation: {
            type: 'string',
            required: true,
            isIn: ['set', 'get', 'delete'],
			description: 'The operation to be performed on Redis'
        },
        key: {
            type: 'string',
            required: true,
            description: 'The key to be set | fetched'
        },
        value: {
            type: 'ref',
            required: false,
            description: 'The value to be set | fetched'
        }
    },

    exits: {},

    fn: async function (inputs, exits) {
        // Initialize the filename. This variable will be used for logging purposes 
        const FILE_PATH = __filename.split('helpers')[1];

        try {
            // Add the database number to the redis credentials object.
            //Redis will connect to the database as soon as it connects to the server
            let redisInfo = sails.config.custom.redis;
            redisInfo.credentials.db = inputs.dbNumber;

            // if the method is set, make sure that the value field is supplied
            if(inputs.method === "set" && !inputs.value)
                return exits.success({
                    status: "logicalError",
                    data: "Missing data to be inserted into Redis"
                }); 
            

            sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Creating a Redis connection to database number ${inputs.dbNumber}`);
            // Create the Redis client and return a set of promisified functions
            const redisClient = await lib.createRedisClient(redisInfo, FILE_PATH, inputs.requestId);
            sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Successfully created a Redis connection to database number ${inputs.dbNumber}`);
            
            let response;

            // if the method is set, save the key value pair in the database
            if(inputs.operation === "set") {
                sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Inserting into Redis: db: ${inputs.dbNumber}, key: ${inputs.key}, value: ${inputs.value}`);
                response = await redisClient.set(inputs.key, inputs.value);
                sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Successfully inserted into Redis: db: ${inputs.dbNumber}, key: ${inputs.key}, value: ${inputs.value}`);
            }
            // if the method is delete, delete the key from the database
            else if(inputs.operation === "delete") {
                sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Deleting from Redis: db: ${inputs.dbNumber}, key: ${inputs.key}`);
                response = await redisClient.del(inputs.key);
                sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Successfully deleted from Redis: db: ${inputs.dbNumber}, key: ${inputs.key}`);
            }

            else if(inputs.operation === "get") {
                sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Fetching from Redis: db: ${inputs.dbNumber}, key: ${inputs.key}`);
                response = await redisClient.get(inputs.key);
                // TODO. if the response is null, change the log
                sails.log.info(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Successfully fetched from Redis: db: ${inputs.dbNumber}, key: ${inputs.key}`);
            }

            redisClient.quit();
            return exits.success({status: "success", data: response});

        } catch (error) {
            sails.log.error(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: Redis server error:`);
            sails.log.error(`Helper ${FILE_PATH} -- Request ID ${inputs.requestId}: ${error}`);
            return exits.success({
                status: 'serverError',
                data: "Redis server error while executing the query"
            });

        }
    }
};

let lib = {
/**
     * Returns a set of promisified redis functions
     */
    createRedisClient: async (redisInfo, FILE_PATH, requestId) => {
        const redis = require('redis');
        const { promisify } = require('util');

        const REDIS_CLIENT = redis.createClient(redisInfo.credentials.port, redisInfo.credentials.host, {
            retry_strategy: (options) => {
                
                if (options.error) {
                    sails.log.error(`Helper ${FILE_PATH} -- Request ID ${requestId}: Attempt ${options.attempt}/${redisInfo.config.maxAttempts} Error while connecting to the redis server`);
                    sails.log.error(`Helper ${FILE_PATH} -- Request ID ${requestId}: ${options.error}`);
                }
                if (options.attempt >= redisInfo.config.maxAttempts) {
                    sails.log.error(`Helper ${FILE_PATH} -- Request ID ${requestId}: Exceeded the maximum number of attempts (${redisInfo.config.maxAttempts}). Exiting...`);
                    return({status: 'serverError', data: `Exceeded the maximum number of attempts (${redisInfo.config.maxAttempts}). Exiting...`});
                }
                // reconnect after 250 ms
                return redisInfo.config.retryDelay;
            },
        });

        REDIS_CLIENT.on('error', (error) => {
            sails.log.error(`Helper ${FILE_PATH} -- Request ID ${requestId}: ${error}`);
            return({status: 'serverError', data: `Redis Server Error`});
        });
        
        // promisify the "select database" function and select the database
        const selectDatabase = promisify(REDIS_CLIENT.select).bind(REDIS_CLIENT);
        sails.log.info(`Helper ${FILE_PATH} -- Request ID ${requestId}: Selecting database ${redisInfo.credentials.db}`);
        await selectDatabase(redisInfo.credentials.db);
        sails.log.info(`Helper ${FILE_PATH} -- Request ID ${requestId}: Successfully selected database ${redisInfo.credentials.db}`);

        const set = (key, value) => {
			return promisify(REDIS_CLIENT.set).bind(REDIS_CLIENT.set(key, value));
		};
		const get = async (key) => {
			const asyncget = promisify(REDIS_CLIENT.get).bind(REDIS_CLIENT);
			return await asyncget(key);
		};
        
        const del = async (key) => {
            const asyncDelete = promisify(REDIS_CLIENT.del).bind(REDIS_CLIENT);
			return await asyncDelete(key);
        };

		const quit = () => {
			return promisify(REDIS_CLIENT.quit).bind(REDIS_CLIENT.quit());
		};
        return { selectDatabase, set, get, del, quit };
    }
};



