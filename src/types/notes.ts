interface Note {
    id?: number,
    title: string,
    description: string,
    document?: string,
    user_id: number
}

interface Data {
    note: Note | Note[] | null,
}

interface ModelResponse {
    status: number,
    data: Data,
    error: string
    message: string
}

export type {
    Note,
    Data,
    ModelResponse
}