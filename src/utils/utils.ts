// @ts-ignore
import oracledb from "oracledb"
import { dbConfig } from '../db/config.js'

// @ts-ignore
import { bcrypt } from "bcrypt";
import jwt from 'jsonwebtoken'
import type { User } from "../types/users.js";
    
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

interface JwtTokenGeneratorResult {
    error?: string | null,
    access_token?: string | null,
    refresh_token?: string | null
}

export const jwt_token_generator = (user: User): JwtTokenGeneratorResult => {
    const jwt_access_key = process.env.JWT_ACCESS_KEY;
    const jwt_refresh_key = process.env.JWT_REFRESH_KEY;
    const jwt_refresh_token_time = process.env.JWT_REFRESH_TOKEN_EXPIRE_TIME
    const jwt_access_token_time = process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME

    if (
        !jwt_access_key ||
        !jwt_refresh_key ||
        !jwt_refresh_token_time || 
        !jwt_access_token_time
    ) return {
        error: "Missing environment variables"
    }

    const payload = {
        user_id: user.id,
    }

    let refresh_token = jwt.sign(payload, jwt_refresh_key, {
        expiresIn: jwt_refresh_token_time as any
    })
    let access_token =  jwt.sign(payload, jwt_access_key, {
        expiresIn: jwt_access_token_time as any
    })
    
    return {
        refresh_token,
        access_token
    }
}

export const db_error_handler = async(error: unknown, model: string) => {
    try {
        const rollbackConnection = await oracledb.getConnection(dbConfig);
        await rollbackConnection.rollback();
    } catch (error) {
        return {
            status: 500,
            data: { [model]: null },
            error: error instanceof Error ? error.message : "Unknown error",
            message: "Error during rollback"
        }
    }

    return {
        status: 500,
        data: { [model]: null },
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Internal server error"
    }
}

export const password_encryptor = async(password: string) => {
    const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");
    return await bcrypt.hash(password, saltRounds);
}

export const validate_email = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
    if(!re.test(email)){
        return false;
    }
    return true;
}