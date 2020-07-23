/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: Checks if a person is an admin or not. If the user is not an admin, then the request will not be forwarded to the API
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

module.exports = async function (req, res, cb) {
        if(!req.headers.authorization)
            return res.forbidden({status: "forbidden", data: "Missing or invalid access token."});

        
        let userInfo = await sails.helpers.verifyJwt.with({
            accessToken: req.headers.authorization,
            requestId: req.headers.requestId
        });

        // If the result from verify JWT is not a success, return an error response
        if(userInfo.status !== "success") 
            return res[userInfo.status](userInfo);

        // If the user is not an admin, return an unauthorized response
        if(!userInfo.data.isAdmin)
            return res.unauthorized({status: "unauthorized", data: "You are not permitted to perform this operation."});

        // if the user is an admin, store the user information in the headers
        req.headers.user = JSON.stringify(userInfo.data);
        
        return cb();
};