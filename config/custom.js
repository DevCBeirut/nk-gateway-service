/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */

module.exports.custom = {
	responseTypes: {
		logicalError: {
			description: 'This response type informs the client that there was an error, specifically handled by the respective microservice',
			responseType: 'logicalError',
			statusCode: 400
		},
		unauthorized: {
			description: 'This response type informs the client that the access to the resource is forbidden due to an invalid token',
			responseType: 'logicalError',
			statusCode: 401
		},
		forbidden: {
			description: 'This response type informs the client that an unauthorized action has been requested',
			responseType: 'forbidden',
			statusCode: 403
		},
		serverError: {
			description: 'This response type informs the client that an unexpected error has occurred in the catch block of the action',
			responseType: 'serverError',
			statusCode: 500
		},
	},
	jwt: {
		secret: process.env.JWT_SECRET	
	},
	redis: {
		config: {
			maxAttempts: process.env.REDIS_MAX_ATTEMPTS ? parseInt(process.env.REDIS_MAX_ATTEMPTS) : 3,
			retryDelay: process.env.REDIS_RETRY_DELAY ? parseInt(process.env.REDIS_RETRY_DELAY) : 250 
		},
		credentials: {
			host: process.env.REDIS_HOST || "localhost",
			port: parseInt(process.env.REDIS_PORT) || 6379,
			password: process.env.REDIS_PASSWORD
		}
	},
	microservices: {
		backend: {
			host: process.env.BACKEND_HOST || "localhost",
			port: process.env.BACKEND_PORT || 1338
		}
	},
	requestConfig: {
		maxRetryAttempts: parseInt(process.env.REQUEST_MAX_ATTEMPTS) || 3
	}
};
