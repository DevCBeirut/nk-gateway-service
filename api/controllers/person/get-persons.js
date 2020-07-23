module.exports = {


	friendlyName: 'Get all persons',


	description: 'Retrieves all the person records from the database',


    inputs: {},
    
    exits: sails.config.custom.responseTypes,

    fn: async function (inputs, exits) {

        // Initialize the request ID and the filename. These variables will be used for logging and tracing purposes
        const REQUEST_ID = this.req.headers.requestId;
		const FILE_PATH = __filename.split('controllers')[1];

		sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Starting...`);

        // save the access and refresh tokens in redis
        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Attempting to fetch the persons from Redis`);
        
        let redisResponse = await sails.helpers.redisWrapper.with(
            {
                requestId: REQUEST_ID,
                dbNumber: 0,
                operation: 'get',
                key: "persons"
            }
        )       

        // If an error response is returned, return it to the user
        if(redisResponse && redisResponse.status !== "success") 
            return exits[redisResponse.status](redisResponse);
        
        // No need for error handling since it's only caching. If there was a problem in caching the result, the request must continue normally
        // If the data is found in redis, return it directly
        if(redisResponse.data) {
            redisResponse.data = JSON.parse(redisResponse.data);
            sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Successfully found the list of persons in Redis.`);
            return exits[redisResponse.status](redisResponse);
        }

        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Unable to find data in Redis. Routing the request to the backend service...`);
        // Use the helper function to fetch all the persons
        let response = await sails.helpers.requestRouter.with(
            {
                url: this.req.url,
                headers: {requestId: this.req.headers.requestId},
                method: 'GET',
                requestId: REQUEST_ID
            }
        );
        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Returning a response with status ${response.status}`);
        
        // If an error response is returned, return it to the user
        if(response && response.status !== "success") {
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: ${response.data}`);
            return exits[response.status](response);
        }
        // If no records were found in the database, log it
        if(!response.data || response.data.length === 0) {
            response.data = [];
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Unable to find any person record in the database.`);
        }
        else 
            sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Returning ${response.data.length} person records.`);
        
        // No need for error handling since it's only caching. If there was a problem in caching the result, the request must continue normally
        await sails.helpers.redisWrapper.with(
            {
                requestId: REQUEST_ID,
                dbNumber: 0,
                operation: 'set',
                key: "persons",
                value: JSON.stringify(response.data)
            }
        )

        // If an error response is returned, return it to the user
        if(redisResponse && redisResponse.status !== "success") 
            return exits[redisResponse.status](redisResponse);

        return exits[response.status](response);
    }
}