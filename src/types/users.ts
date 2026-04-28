interface User {
    id? : number,
    full_name?: string,
    password?: string,
    email?: string,
    created_at?: Date,
}

interface Data {
    user: User | User[] | null,
}

interface UsersModelResponse {
    status: number,
    data: Data,
    error: string
    message: string
}

export type {
    User,
    Data,
    UsersModelResponse
}