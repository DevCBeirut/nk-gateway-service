module.exports = {


	friendlyName: 'Create a person record',


	description: 'Creates a new person record in the database, provided that this user does not exist',


    inputs: {
        firstName: {
            type: 'string',
            description: 'The first name of the person',
            required: true
        },
        lastName: {
            type: 'string',
            description: 'The last name of the person',
            required: true
        },
        age: {
            type: 'number',
            description: 'The age of the person',
            required: true,
            min: 1,
            max: 120
        },
        email: {
            type: 'string',
            description: 'The email of the person',
            required: true
        },
        password: {
            type: 'string',
            description: 'The password of the person',
            minLength: 8,
            maxLength: 32,
            required: true
        },
        dob: {
            type: 'string',
            description: 'Date of birth YYYY-MM-DD',
            required: true,
            regex: /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/
        },
        isAdmin: {
            type: 'boolean',
            description: 'Specifies if the user is an admin or not',
            required: false,
            defaultsTo: false
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
                body: inputs,
                method: 'POST',
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