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

        const userInfo = JSON.parse(this.req.headers.user);

        console.log(this.req.url + "/" + userInfo.personId)
        // Use the helper function to call the backend
        let response = await sails.helpers.requestRouter.with(
            {
                url: this.req.url + "/" + userInfo.personId,
                headers: {requestId: this.req.headers.requestId},
                method: 'GET',
                requestId: REQUEST_ID
            }
        );
        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Returning a response with status ${response.status}`);
        
        // If an error response is returned, return it to the user
        if(response && response.status !== "success") 
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: ${response.data}`);        

        return exits[response.status](response);
    }
}