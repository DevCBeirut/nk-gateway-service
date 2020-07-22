module.exports.routes = {
	'GET /health': { action: 'health-check' },

	'GET /backend/persons': { action: 'person/get-persons' },
	'GET /backend/person': { action: 'person/get-person-details' },
	'POST /backend/person' : {action: 'person/create-person'},
	'DELETE /backend/person/:id' : {action: 'person/delete-person'},

	'POST /backend/login': { action: 'authentication/login'},
	'PUT /backend/token/refresh': {action: 'authentication/refresh-token'}
};
