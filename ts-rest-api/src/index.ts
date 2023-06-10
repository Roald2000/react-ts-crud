import express, { Request, Response, NextFunction } from 'express';

import cors from 'cors';
import { CustomErrorInterFace, createCustomError, setResponseError } from './helper';
import { createItem, deleteItem, fetchItem, fetchItemList, getItemTotalPrice, updateItem } from './Item.controller';




const app = express();

app.use(cors());
app.use(express.json());


app.get('/api/fetch/item/list', fetchItemList)
app.get('/api/fetch/item/:search_string', fetchItem);
app.post('/api/create/item', createItem);
app.patch('/api/update/item/:item_id', updateItem);
app.get('/api/fetch/item/total_price/:item_name', getItemTotalPrice);
app.delete('/api/remove/item/:item_id', deleteItem);
app.delete('/api/clear/item');


app.use((req: Request, res: Response, next: NextFunction) => {
    const errorInvalidRoute = createCustomError("Invalid Route", 404);
    next(errorInvalidRoute);
})


app.use((error: CustomErrorInterFace, req: Request, res: Response, next: NextFunction) => {
    const errorStatus = error.status || 500;
    const errorMessage = error.message || "Internal Server Error";
    console.log(error);
    setResponseError(res, errorStatus, {
        errorMessage,
        errorStatus
    })
})


app.listen(9090, () => {
    console.log('Up and running! @ http://localhost:9090');
})