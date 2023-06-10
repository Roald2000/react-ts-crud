import { Response } from "express";

export interface CustomErrorInterFace {
    message?: string,
    status?: number
}

export function createCustomError(err: string, status: number): CustomErrorInterFace {
    const message = new Error(err);
    return Object.assign(message, { status });
}

interface SetResponseInterface {
    (res: Response, statusCode: number, responseData?: any | any[]): any
}

export const setResponse: SetResponseInterface = (res: Response, statusCode: number, responseData: any) => {
    return !responseData ? res.sendStatus(statusCode) : res.status(statusCode).send(typeof responseData === 'string' ? { message: responseData, status: statusCode } : responseData);
}

export const setResponseError: SetResponseInterface = (res: Response, statusCode: number, responseData: any) => {
    return res.status(statusCode).send(responseData);
}

export function createPlaceholder<T>(arrlength: number, placeholder: string): string {

    let container: any[] = [];

    for (let index = 0; index < arrlength; index++) {
        container.push(placeholder);
    }

    return container.join(",");

}