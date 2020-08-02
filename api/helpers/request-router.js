module.exports = {


	friendlyName: 'Login',


	description: 'Logs a user based on their email and password, and generates a JWT token and refresh token',


    inputs: {
        url: {
			type: 'string',
			required: true,
			description: 'The URL to be redirected (e.g., /backend/login)'
        },
        requestId: {
			type: 'string',
			required: true,
			description: 'The request ID to send to the microservice'
		},
		method: {
			type: 'string',
            required: true,
            isIn: ["GET", "POST", "PUT", "DELETE"],
			description: 'The method of the request'
		},
		body: {
			type: 'ref',
			required: false,
			description: 'The request body'
		},
		headers: {
			type: 'ref',
			required: false,
			description: 'The request headers'
		},
		query: {
			type : 'ref',
			required : false,
			description : 'The query string parameters'
		}
    },
    
    exits: sails.config.custom.responseTypes,

    fn: async function (inputs, exits) {
		const got = require("got");

		const REQUEST_ID = inputs.requestId;
        const FILE_PATH = __filename.split('helpers')[1];
		
		const targetServiceName = inputs.url.split('/')[1];
		// Get the target service host and port based on the service name
		const targetService = sails.config.custom.microservices[targetServiceName];
		// construct the URL
		const uri = `http://${targetService.host}:${targetService.port}${inputs.url.slice(targetServiceName.length + 1)}`;

        try {

            const options = {
                method: inputs.method,
                headers: inputs.headers,
                query: inputs.query,
				json: inputs.body,
				responseType: 'json',
				throwHttpErrors: false,
				retry: {
					limit: sails.config.custom.requestConfig.maxRetryAttempts,
					statusCodes: [500]
				}
			};
			
			sails.log.info(`Helper ${FILE_PATH} -- Request ID ${REQUEST_ID}: Routing a request to microservice ${targetServiceName} with:`);
			sails.log.info(`Helper ${FILE_PATH} -- Request ID ${REQUEST_ID}: URI: ${uri}`);
			sails.log.info(`Helper ${FILE_PATH} -- Request ID ${REQUEST_ID}: properties: ${JSON.stringify(options,null,2)}`);

			let response = await got(uri, options);
			
			sails.log.info(`Helper ${FILE_PATH} -- Request ID ${REQUEST_ID}: Successfully routed a request to microservice ${targetServiceName}`);
			return exits.success(response.body);
            
        } catch (error) {
            
            sails.log.error(`Helper ${FILE_PATH} -- Request ID ${REQUEST_ID}: Error while redirecting the request to microservice ${targetServiceName}`);
			sails.log.error(`Helper ${FILE_PATH} -- Request ID ${REQUEST_ID}: ${error}`);
			return exits.success({
                status: "serverError",
                data: `Error while redirecting the request to microservice ${targetServiceName}`
            });
        }
        
    }
}