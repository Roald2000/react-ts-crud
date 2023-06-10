import { useState } from 'react';
import swal from 'sweetalert';
import { RequestFail } from './Home';
import { useNavigate } from 'react-router-dom';

export interface PayloadInputs {
    item_name?: string,
    item_price?: number,
    item_quantity?: number,
}

export interface RequestOK {
    message: string,
    status: number
}

export default function CreateItem(): JSX.Element {
    // Utilities
    const [toRedir, setToRedir] = useState<boolean>(false);
    const redirTo = useNavigate();
    const [createPayload, setCreatePayload] = useState<PayloadInputs>({});

    const handleInputChange = (inputEvent: React.ChangeEvent<HTMLInputElement>) => {
        setCreatePayload((values): PayloadInputs => ({ ...values, [inputEvent.target.id]: inputEvent.target.value }));
    }

    const handleFormSubmit = async (formEvent: React.FormEvent<HTMLFormElement>) => {
        formEvent.preventDefault();
        try {
            const result = await fetch('http://192.168.254.183:9090/api/create/item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(createPayload)
            })
            if (result.ok) {
                const data: RequestOK = await result.json();
                const { message, status } = data;
                await swal("Create Success! " + status, message, { icon: 'success', closeOnClickOutside: true, closeOnEsc: true, buttons: [false], timer: 1200 })
                toRedir && redirTo('/');
            } else {
                throw await result.json();
            }
        } catch (error: any) {
            const failedCreate: RequestFail = await error;
            const { errorMessage, errorStatus } = failedCreate;
            await swal("Create Failed! " + errorStatus, errorMessage, { icon: 'error', closeOnClickOutside: true, closeOnEsc: true, buttons: [false], timer: 1200 })

        }

    }

    return <form onSubmit={handleFormSubmit} className="max-w-[468px] mx-auto my-0 bg-slate-300 p-4 rounded">
        <h1 className="text-3xl font-bold">New Item</h1>
        <br />
        <label className='flex justify-start w-fit ml-auto gap-2 font-semibold cursor-pointer' htmlFor="toggle-redir">
            <p className='text-xs cursor-pointer'>Home on Submit</p>
            <input className='cursor-pointer' type="checkbox" onChange={(): void => {
                setToRedir(!redirTo);
            }} name="" id="toggle-redir" />
        </label>
        <br />
        <div className=" bg-slate-400 p-2 rounded-md">
            <label className="flex flex-col gap-1" htmlFor="item_name">
                <span className="">Item Name</span>
                <input onChange={handleInputChange} className="p-1 rounded-md" type="text" id="item_name" required />
            </label>
            <label className="flex flex-col gap-1" htmlFor="item_price">
                <span className="">Price</span>
                <input onChange={handleInputChange} className="p-1 rounded-md" type="number" id="item_price" required />
            </label>
            <label className="flex flex-col gap-1" htmlFor="item_quantity">
                <span className="">Quantity</span>
                <input onChange={handleInputChange} className="p-1 rounded-md" type="number" id="item_quantity" required />
            </label>
        </div>
        <br />
        <div className="flex flex-row gap-1 justify-center items-center">
            <button type="submit">Create</button>
            <button type="reset">Reset</button>
        </div>
    </form>
}