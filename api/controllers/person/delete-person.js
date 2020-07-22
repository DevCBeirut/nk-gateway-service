module.exports = {


	friendlyName: 'Delete Person',


	description: 'Deletes a person record from the database',


    inputs: {
        id: {
			type: 'string',
			required: true,
			description: 'The Arango ID of the person.'
        }
    },
    
    exits: sails.config.custom.responseTypes,

    fn: async function (inputs, exits) {

        // Initialize the request ID and the filename. These variables will be used for logging and tracing purposes
        const REQUEST_ID = this.req.headers.requestId;
		const FILE_PATH = __filename.split('controllers')[1];

		sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Starting...`);

         // Use the helper function to fetch all the persons
         let response = await sails.helpers.requestRouter.with(
            {
                url: this.req.url,
                headers: {requestId: this.req.headers.requestId},
                method: 'DELETE',
                requestId: REQUEST_ID
            }
        );
        sails.log.info(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: Returning a response with status ${response.status}`);
        
        // If an error response is returned, return it to the user
        if(response && (response.status === "logicalError") || response.status === "serverError") {
            sails.log.warn(`Controller ${FILE_PATH} -- Request ID ${REQUEST_ID}: ${response.data}`);
            return exits[response.status](response);
        }

        return exits[response.status](response);
    }
}