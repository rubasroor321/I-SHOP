import { expressjwt } from 'express-jwt';

function authJwt() {
    const secret = process.env.Secret;
    const api = process.env.API_URL;
    return expressjwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: async (req, token) => {
            if (!token.payload.isAdmin) {
                return true; // Access is revoked
            }
            return false; // Access is not revoked
        }
    }).unless({
        path: [
            { url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] }, 
            { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/messages(.*)/, methods: ['GET', 'POST'] },
            { url: /\/api\/v1\/messages\/send/, methods: ['POST'] }, 
            { url: /\/api\/v1\/messages\/.*\/.*$/, methods: ['GET'] },
            `${api}/users/login`,
            `${api}/users/register`,
            
        ]
    });
}

export default authJwt;
