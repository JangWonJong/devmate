import type { AxiosError } from "axios";

export function apiErrorMessage(e: any, fallback: string) {

    const err = e as AxiosError<any>
    const msg =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        err?.message

    return msg ?? fallback

}
