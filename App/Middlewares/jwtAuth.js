import JWT from 'jsonwebtoken'
import dotenv from "dotenv"
import Debug from "../Plugins/Debug.js";
const env = dotenv.config().parsed;

const restrictAccessByRole = (allowedRoles) => {
    return async function(req, res, next) {  
        try{
            if (req.headers.authorization) {
                const token = req.headers.authorization.split(' ')[1]

                JWT.verify(token, env.JWT_ACCESS_TOKEN_SECRET, (err, data) => {
                    if (err) {
                        if(err.name == 'TokenExpiredError') {
                            throw { 
                                code: 500,
                                message: 'TOKEN_EXPIRED',
                                req
                            }
                        } else {
                            throw { 
                                code: 500,
                                message: 'TOKEN_IS_NOT_VALID',
                                req
                            }
                        }
                    } else { 
                        req.JWT = data
                        const userRoles = req.JWT.roles;

                        // Periksa apakah user memiliki salah satu dari allowedRoles
                        const isAllowed = allowedRoles.some((role) => userRoles.includes(role));

                        if (!isAllowed) {
                            throw { 
                                code: 403,
                                message: 'Forbidden: Access is denied',
                                req
                            }
                        }

                        next()
                    }
                })
            } else {
                throw { 
                    code: 500,
                    message: 'TOKEN_REQUIRED',
                    req
                }
            }
        } catch(err) {
            await Debug.logging(err.code, err.message, null, err.req);
            return res.status(401).json({
                success : false,
                message : err.message
            })
        }
    }
}

export default restrictAccessByRole