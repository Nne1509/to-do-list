const jwt = require('jsonwebtoken');

const getUserID = (req) => {
    try {
        const token = req.headers.authorization
        const decodedToken = jwt.decode(token)
        const userID = decodedToken.user.user_id
        return (userID)
    } catch (error) {
        return res.send({error});
    }
};


module.exports = { getUserID }