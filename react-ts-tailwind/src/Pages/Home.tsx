import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PayloadInputs, RequestOK } from './CreateItem';
import swal from 'sweetalert';


export interface ResultFetchList {
    item_id: number,
    item_name: string,
    item_price: number,
    item_quantity: number,
    modified_at: string
}

export interface RequestFail {
    errorMessage: string,
    errorStatus: number
}



export default function Home(): JSX.Element {

    const [modalContent, setModalContent] = useState<ResultFetchList>();
    const ref_item_id: any = useRef(null);



    const [updatePayload, setUpdatePayload] = useState<PayloadInputs>({});

    //  States
    const [searchInput, setSearchInput] = useState<string>('')

    const [listData, setListData] = useState<ResultFetchList[] | RequestFail>([]);

    // Functions
    async function FetchItemList() {
        const resultFetch = await fetch('http://192.168.254.183:9090/api/fetch/item/list');
        const data = await resultFetch.json();
        if (resultFetch.ok) {
            setListData(data); // ResultFetchList[]
        } else {
            setListData(data); // RequestFail
        }
    }

    async function handleSubmitSearchInput(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const resultFetch = await fetch('http://192.168.254.183:9090/api/fetch/item/' + searchInput);
        const data = await resultFetch.json();
        if (resultFetch.ok) {
            setListData(data); // ResultFetchList[]
        } else {
            setListData(data); // RequestFail
            setTimeout(async () => {
                await FetchItemList();
            }, 1500);
        }
    }

    useEffect(() => {
        FetchItemList()
        return () => setListData([])
    }, []);

    const handleInputChange = (inputEvent: React.ChangeEvent<HTMLInputElement>) => {
        setUpdatePayload((values): PayloadInputs => ({ ...values, [inputEvent.target.id]: inputEvent.target.value }));
        console.log(ref_item_id.current.value);
    }

    return <>
        <form onSubmit={handleSubmitSearchInput} className='flex flex-row gap-3 items-center justify-start'>
            <span>Search Item</span>
            <input className='p-2 rounded-md bg-slate-200' onChange={(e) => setSearchInput(e.target.value)} />
            <button type='submit'>🔎</button>
            <button onClick={async () => {
                await FetchItemList();
            }} type='button'>🔄</button>
        </form>
        <br />
        <div className='flex flex-row justify-center items-stretch flex-wrap gap-3'>
            {Array.isArray(listData) ? listData.map((item) =>
                <div className='p-2 rounded-md flex-grow-0 flex-shrink basis-[250px] h-fit bg-slate-200' key={item.item_id}>
                    <ul className='flex flex-row gap-3 justify-end'>
                        <li className='text-xs font-semibold'>
                            <button onClick={() => {
                                setModalContent(item);

                                const modal = document.getElementById('update-modal') as HTMLDialogElement;

                                modal.showModal();

                                modal.addEventListener('click', (e) => {
                                    const dialogDimensions = modal.getBoundingClientRect();
                                    if (
                                        e.clientX < dialogDimensions.left ||
                                        e.clientX > dialogDimensions.right ||
                                        e.clientY < dialogDimensions.top ||
                                        e.clientY > dialogDimensions.bottom
                                    ) {
                                        modal.close();
                                    }

                                });

                            }} type='button'>Update</button>
                        </li>
                        <li className='text-xs font-semibold'><button onClick={async () => {
                            try {
                                const result = await fetch('http://192.168.254.183:9090/api/remove/item/' + item.item_id, {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' }
                                });

                                if (result.ok) {
                                    const data: RequestOK = await result.json();
                                    const { message, status } = data;
                                    await swal("Delete Success! " + status, message, { icon: 'success', closeOnClickOutside: true, closeOnEsc: true, buttons: [false], timer: 1200 })
                                    await FetchItemList();
                                } else {
                                    throw await result.json();
                                }

                            } catch (error: any) {
                                const failedCreate: RequestFail = await error;
                                const { errorMessage, errorStatus } = failedCreate;
                                await swal("DeleteFailed Failed! " + errorStatus, errorMessage, { icon: 'error', closeOnClickOutside: true, closeOnEsc: true, buttons: [false], timer: 1200 })
                            }
                        }} type='button'>Delete</button></li>
                    </ul>
                    <ul className=' '>
                        <li className=''>Name : {item.item_name}</li>
                        <li className=''>Price : {item.item_price}</li>
                        <li className=''>Quantity : {item.item_quantity}</li>
                    </ul>
                    <ul>
                        <li>{item.modified_at}</li>
                    </ul>
                </div>) : <p>{listData.errorMessage} | <Link to={'/create'}>Add Item</Link></p>
            }
        </div>
        <dialog id='update-modal' className='-z-1'>
            <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                    const result = await fetch('http://192.168.254.183:9090/api/update/item/' + ref_item_id.current.value, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatePayload),
                    });
                    if (result.ok) {
                        const data: RequestOK = await result.json();
                        const { message, status } = data;
                        const current_modal = document.querySelector('#update-modal') as HTMLDialogElement;
                        current_modal.close();
                        await swal("Update Success! " + status, message, { icon: 'success', closeOnClickOutside: true, closeOnEsc: true, buttons: [false], timer: 1200 })
                        await FetchItemList();
                    } else {
                        throw await result.json();
                    }
                } catch (error: any) {
                    const failedCreate: RequestFail = await error;
                    const { errorMessage, errorStatus } = failedCreate;
                    await swal("Update Failed! " + errorStatus, errorMessage, { icon: 'error', closeOnClickOutside: true, closeOnEsc: true, buttons: [false], timer: 1200 })
                }

            }} className='max-w-[468px] p-3'>
                <div>
                    <h1 className='text-3xl'>Now Modifiying Item #{modalContent?.item_id} | {modalContent?.item_name}</h1>
                </div>
                <br />
                <div className='flex flex-col gap-3'>
                    <input defaultValue={modalContent?.item_id} ref={ref_item_id} type="text" name="" id="" hidden />
                    <label className='flex flex-col gap-2' htmlFor="item_name">
                        <span>Name</span>
                        <input onChange={handleInputChange} className='p-1 rounded bg-slate-200' type="text" id='item_name' placeholder={modalContent?.item_name} />
                    </label>
                    <label className='flex flex-col gap-2' htmlFor="item_price">
                        <span>Price</span>
                        <input onChange={handleInputChange} className='p-1 rounded bg-slate-200' type="number" id='item_price' />
                    </label>
                    <label className='flex flex-col gap-2' htmlFor="item_quantity">
                        <span>Quantity</span>
                        <input onChange={handleInputChange} className='p-1 rounded bg-slate-200' type="number" id='item_quantity' />
                    </label>
                </div>
                <br />
                <div>
                    <button type='submit'>Update</button>
                    <button type='reset' onClick={() => {
                        document.querySelector('dialog')?.close();
                    }}>Exit</button>
                </div>
            </form>
        </dialog>
    </>
}





