
export type ApiError = {code: string, message: string}

export type APiResponse<T> = {
    success: boolean
    data?: T
    error: ApiError
}