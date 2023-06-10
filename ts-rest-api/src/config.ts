import { Request, Response, NextFunction } from "express";
import { createPool, MysqlError, PoolConnection, queryCallback } from "mysql";
import { createCustomError } from "./helper";


 

const pool = createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'test'
});


export const checkDatabaseConnection = (req: Request, res: Response, next: NextFunction) => {
    try {
        pool.getConnection((error: MysqlError, connection: PoolConnection) => {
            if (error) {
                throw createCustomError(error.message, 500);
            } else {
                connection.release();
                next();
            }
        })
    } catch (error) {
        next(error);
    }
}



export function executeQuery(query: string, params?: any[] | string): Promise<any> {
    return new Promise((resolve, reject) => {
        pool.query(query, Array.isArray(params) ? params : [params], (error, success) => {
            if (error) {
                reject(error);
            } else {
                resolve(success);
            }
        });
    });
}