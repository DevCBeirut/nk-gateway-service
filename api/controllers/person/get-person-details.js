module.exports = {


	friendlyName: 'Get a person based on their Arango ID. The ID must be provied through the JWT access token',


	description: 'Retrieves a person record from the database',


    inputs: {},
    
    exits: sails.config.custom.responseTypes,

    fn: async function (inputs, exits) {

        // Initialize the request ID and the filename. These variables will be used for logging and tracing purposes
        const REQUEST_ID = this.req.headers.requestId;
		const FILE_PATH = __filename.split('controllers')[1];

		sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Starting...`);

        const userInfo = this.req.headers.user;
        console.log(userInfo);

        return exits.success(userInfo);
    }
}