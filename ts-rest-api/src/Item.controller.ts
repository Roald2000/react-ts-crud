
import { executeQuery } from "./config"
import { createPlaceholder, createCustomError, setResponse } from "./helper";
import { Request, Response, NextFunction } from "express";

async function checkItem<T>(params: any): Promise<boolean> {
    console.log('checkItem Function fired')
    try {
        const query = "SELECT * FROM items_table WHERE CONCAT(item_id,item_name) LIKE ?";
        const data = await executeQuery(query, [`%${params}%`]);
        if (data.length !== 0) {
            return true
        } else {
            return false;
        }
    } catch (error) {
        throw error;
    }
}

export const fetchItemList = async (req: Request, res: Response, next: NextFunction) => {
    console.log('fetchItemList Function fired')
    try {
        const query = "SELECT * FROM items_table LIMIT 100";
        const data = await executeQuery(query);
        if (data.length !== 0) {
            setResponse(res, 200, data);
        } else {
            throw createCustomError("No items", 404);
        }
    } catch (error) {
        next(error);
    }
}

export const fetchItem = async (req: Request, res: Response, next: NextFunction) => {
    console.log('fetchItem Function fired')
    try {
        const query = "SELECT * FROM items_table WHERE CONCAT(item_name, item_price, item_quantity) LIKE ?";
        const { search_string } = req.params;
        const data = await executeQuery(query, [`%${search_string}%`]);
        if (data.length !== 0) {
            setResponse(res, 200, data);
        } else {
            throw createCustomError(`No results for '${search_string}'`, 404);
        }
    } catch (error) {
        next(error);
    }
}

export const createItem = async (req: Request, res: Response, next: NextFunction) => {
    console.log('createItem Function fired')
    try {

        const { item_name, item_price, item_quantity } = req.body;
        const isvalid = await checkItem<boolean>(item_name);
        if (isvalid) {
            throw createCustomError("Create Failed", 409)
        } else {
            let params = [item_name, item_price, item_quantity];

            const query = `INSERT INTO items_table(item_name,item_price,item_quantity) VALUES(${createPlaceholder(params.length, "?")})`;
            await executeQuery(query, params) && setResponse(res, 201, "Item Created");

        }
    } catch (error) {
        next(error);
    }
}

export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
    console.log('updateItem Function fired')
    try {
        const { item_id } = req.params;
        const { item_name, item_price, item_quantity } = req.body;
        let params = [item_name, item_price, item_quantity];
 

        const isvalid = await checkItem<boolean>(item_id);

        if (isvalid) {

            const query = "UPDATE items_table SET item_name = ?, item_price = ?, item_quantity = ? WHERE item_id = ? LIMIT 1";
            await executeQuery(query, [...params, item_id]);
            setResponse(res,201,"Item Updated");
        } else {
            throw createCustomError("Updated Failed", 404);
        }
    } catch (error) {
        next(error);
    }
}

export const getItemTotalPrice = async (req: Request, res: Response, next: NextFunction) => {
    console.log('getItemTotalPrice Function fired')
    try {

        const isvalid = await checkItem<boolean>(req.params.item_name);

        if (!isvalid) {
            throw createCustomError("Item does not exist", 404);
        } else {
            const query = `SELECT 
            item_id,item_name,item_price,item_quantity,SUM(item_price * item_quantity) as item_total_price, COUNT(*) as item_total
           FROM items_table WHERE item_name = ?`;
            const data = await executeQuery(query, req.params.item_name);
            setResponse(res, 200, data);
        }


    } catch (error) {
        next(error);
    }
}

export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
    console.log('deleteItem Function fired')
    try {
        const query = "DELETE FROM items_table WHERE item_id = ?";

        const { item_id } = req.params;

        const isvalid = await checkItem<boolean>(item_id)

        if (isvalid) {
            await executeQuery(query, item_id) && setResponse(res, 200, "Item Deleted")
        } else {
            throw createCustomError("Item already deleted", 404);
        }
    } catch (error) {
        next(error);
    }
}

export const clearItemTable = async (req: Request, res: Response, next: NextFunction) => {
    console.log('clearItemTable Function fired')
    try {
        const query = "DELETE FROM items_table";
        await executeQuery(query) && setResponse(res, 200, "Item Table Cleared")

    } catch (error) {
        next(error);
    }
}

