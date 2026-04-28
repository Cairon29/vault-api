// @ts-ignore
import oracledb from "oracledb"
import { dbConfig } from "../db/config.js";
import type { NotesModelResponse, Note } from "../types/notes.js"
import { db_error_handler } from "../utils/utils.js";

export class NotesModel {
    static getAll = async (): Promise<NotesModelResponse> => {
        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig)
            const result = await connection.execute(
                'SELECT * FROM notes',
                [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            return {
                
                data: result.rows,
                error: "",
                status: 200,
                message: "Notes retrieved"
            };
        } catch (error) {
            return await db_error_handler(error, "note");
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
    static getById = async(id: number): Promise<NotesModelResponse> => {
        let connection;
        try {
            connection = await oracledb.getConnection(dbConfig)
            const result = await connection.execute(
                'SELECT * FROM notes WHERE id = :id',
                [id],                
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (result.rows.length === 0) {
                return {
                    data: { note: null },
                    error: "",
                    status: 404,
                    message: "Note not found"
                };
            }

            return {
                data: result.rows,
                error: "",
                status: 200,
                message: "Note retrieved"
            };
        } catch (error) {
            return await db_error_handler(error, "note");
        }
    } 
    static create = async (note: Note): Promise<NotesModelResponse> => {    
        // Oracle logic for creating a note
        let connection;
        try {
            connection = await oracledb.getConnection(dbConfig)
            let query = "INSERT INTO notes (id, title, description, document, fk_user_id) VALUES (notes_seq.NEXTVAL, :title, :description, :document, :user_id) RETURNING id INTO :id";
            const result = await connection.execute(
                query,
                {
                    title: note.title,
                    description: note.description,
                    document: note.document,
                    fk_user_id: note.user_id,
                }
            )

            if (result.rowsAffected === 0) {
                return {
                    status: 500,
                    data: {note: null},
                    error: "Failed to create note",
                    message: "Failed to create note"
                }
            }

            await connection.commit();

            return {
                status: 201,
                data: { note: result.outBinds.id[0] },
                error: "",
                message: "Note created"
            }
        
        } catch (error) {
            return await db_error_handler(error, "note");
        }
    }
    static delete = async(id: number): Promise<NotesModelResponse> => {
        try {
            let connection; 
            connection = await oracledb.getConnection(dbConfig)
            let query = "DELETE FROM notes WHERE id = :id";
            const result = await connection.execute(
                query,
                [id]
            )
            
            if (result.rowsAffected === 0) {
                return {
                    status: 404,
                    data: { note: null },
                    error: "Note not found",
                    message: "Note not found"
                }
            }

            await connection.commit();
            return {
                status: 201,
                data: { note: result.outBinds.id[0] },
                error: "",
                message: "Note created"
            }
        } catch (error) {
            return await db_error_handler(error, "note");
        }
    }
    static update = async(note: Note): Promise<NotesModelResponse> => {
        try {
            let connection; 
            connection = await oracledb.getConnection(dbConfig)
            let query = "UPDATE notes SET title = :title, description = :description, document = :document WHERE id = :id";
            const result = await connection.execute(
                query,
                {
                    title: note.title,
                    description: note.description,
                    document: note.document,
                    id: note.id
                }
            )
            await connection.commit();
            return {
                status: 200,
                data: { note: result.outBinds.id[0] },
                error: "",
                message: "Note updated"
            }
        } catch (error) {
            return await db_error_handler(error, "note");
        }
    }
}