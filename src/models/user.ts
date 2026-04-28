// @ts-ignore
import oracledb from "oracledb"
import { dbConfig } from "../db/config.js";
import { db_error_handler, password_encryptor } from "../utils/utils.js";

// @ts-ignore
import { bcrypt } from "bcrypt";
import type { UsersModelResponse, User } from "../types/users.js";

export class UserModel {
    static getAll = async (): Promise<UsersModelResponse> => {
        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig)
            const result = await connection.execute(
                'SELECT * FROM users',
                [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            return {
                
                data: result.rows,
                error: "",
                status: 200,
                message: "Users retrieved"
            };
        } catch (error) {
            return await db_error_handler(error, "user");
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }
    static getById = async(id: number): Promise<UsersModelResponse> => {
        let connection;
        try {
            connection = await oracledb.getConnection(dbConfig)
            const result = await connection.execute(
                'SELECT * FROM users WHERE id = :id',
                [id],                
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (result.rows.length === 0) {
                return {
                    data: { user: null },
                    error: "",
                    status: 404,
                    message: "User not found"
                };
            }

            return {
                data: result.rows,
                error: "",
                status: 200,
                message: "User retrieved"
            };
        } catch (error) {
            return await db_error_handler(error, "user");
        }
    } 
    static create = async (user: User): Promise<UsersModelResponse> => {    
        // Oracle logic for creating a user
        let connection;
        try {

            if (!user.password) {
                return {
                    status: 400,
                    data: { user: null },
                    error: "Password is required",
                    message: "Password is required"
                }
             }

            const encryptedPassword = await password_encryptor(user.password);
            
            connection = await oracledb.getConnection(dbConfig)
            let query = "INSERT INTO users (id, full_name, password, email) VALUES (users_seq.NEXTVAL, :full_name, :password, :email) RETURNING id INTO :id";
            const result = await connection.execute(
                query,
                {
                    full_name: user.full_name,
                    password: encryptedPassword,
                    email: user.email
                }
            )

            if (result.rowsAffected === 0) {
                return {
                    status: 500,
                    data: {user: null},
                    error: "Failed to create user",
                    message: "Failed to create user"
                }
            }

            if (result.rowsAffected === 0) {
                return {
                    status: 500,
                    data: {user: null},
                    error: "Failed to create user",
                    message: "Failed to create user"
                }
            }

            await connection.commit();

            return {
                status: 201,
                data: { user: result.outBinds.id[0] },
                error: "",
                message: "User created"
            }
        
        } catch (error) {
            return await db_error_handler(error, "user");
        }
    }
    static delete = async(id: number): Promise<UsersModelResponse> => {
        try {
            let connection; 
            connection = await oracledb.getConnection(dbConfig)
            let query = "DELETE FROM users WHERE id = :id";
            const result = await connection.execute(
                query,
                [id]
            )
            
            if (result.rowsAffected === 0) {
                return {
                    status: 404,
                    data: { user: null },
                    error: "User not found",
                    message: "User not found"
                }
            }

            await connection.commit();
            return {
                status: 201,
                data: { user: result.outBinds.id[0] },
                error: "",
                message: "User created"
            }
        } catch (error) {
            return await db_error_handler(error, "user");
        }
    }
    static update = async(user: User): Promise<UsersModelResponse> => {
        try {
            if (!user.id) {
                return {
                    status: 400,
                    data: { user: null },
                    error: "User ID is required",
                    message: "User ID is required"
                }
            }

            let validatedPassword = ""
            if (user.password) {
                validatedPassword = await password_encryptor(user.password);
            }
            if (!validatedPassword) {
                return {
                    status: 400,
                    data: { user: null },
                    error: "Password is required",
                    message: "Password is required"
                }
            }

            let connection; 
            connection = await oracledb.getConnection(dbConfig)
            let query = "UPDATE users SET full_name = :full_name, password = :password, email = :email WHERE id = :id";
            const result = await connection.execute(
                query,
                {
                    full_name: user.full_name,
                    password: validatedPassword,
                    email: user.email,
                    id: user.id
                }
            )
            await connection.commit();
            return {
                status: 200,
                data: { user: result.outBinds.id[0] },
                error: "",
                message: "User updated"
            }
        } catch (error) {
            return await db_error_handler(error, "user");
        }
    }
}