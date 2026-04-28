import jwt from 'jsonwebtoken'
    
export const req_field_validator = (body: Record<string, unknown>, req_field_list: string[]) => {
    for (const field of req_field_list) {
        if (!body[field]) {
            return { 
                success: false,
                status: 400,
                error: `Missing required field: ${field}`
            }
        }
    }
    return {
        success: true,
        status: 200,
        error: null
    }
}

interface User {
    id: string,
    email: string,
    name: string
}

export const jwt_token_generator = (user: User) => {
    const jwt_access_key = process.env.JWT_ACCESS_KEY;
    const jwt_refresh_key = process.env.JWT_REFRESH_KEY;
    const jwt_refresh_token_time = process.env.JWT_REFRESH_TOKEN_EXPIRY_TIME
    const jwt_access_token_time = process.env.JWT_ACCESS_TOKEN_EXPIRY_TIME

    if (
        !jwt_access_key ||
        !jwt_refresh_key ||
        !jwt_refresh_token_time || 
        !jwt_access_token_time
    ) return {
        error: "Missing environment variables"
    }

    const payload = {
        id: user.id,
    }

    let refresh_token = jwt.sign(payload, jwt_refresh_key, {
        expiresIn: jwt_refresh_token_time as any
    })
    let access_token =  jwt.sign(payload, jwt_access_key, {
        expiresIn: jwt_access_token_time as any
    })
    
    return {
        error: null,
        refresh_token,
        access_token
    }
}