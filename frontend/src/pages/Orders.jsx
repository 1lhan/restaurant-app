import { useSignal } from '@preact/signals-react'
import { useQuery } from '@tanstack/react-query'
import { NavLink } from 'react-router-dom';
import TableInfoDiv from '../components/TableInfoDiv';
import { usePostRequest } from '../utils';

export default function Orders({ user }) {
    const tables = useSignal(JSON.parse(localStorage.getItem('tables')))
    const selectedTableNo = useSignal(-1)
    const green = '#86efac';

    const { data: orders, refetch: refetchOrderItems } = useQuery({
        queryKey: ['getOrderItems'],
        queryFn: async () => {
            let _orderItems = await fetch(import.meta.env.VITE_REACT_APP_BACKEND_URL + '/get-order-items').then(res => res.json())
            if (!_orderItems.success) { console.log('Order items could not be fetched'); return [] }
            else return _orderItems.orderItems
        },
        refetchInterval: 5000
    })

    const TablesSection = () => {
        return (
            <div className="tables-section">
                <h3>Tables</h3>
                <div className='tables'>
                    {selectedTableNo.value > -10 && [[0, 0, 12], [9, 10, 11], [6, 7, 8], [0, 4, 5], [1, 2, 3]].map((column, columnIndex) =>
                        <div className='tables-column' key={columnIndex}>
                            {column.map((tableNo, tableIndex) =>
                                <div key={tableIndex} style={{ visibility: tableNo == 0 ? 'hidden' : '' }} className="table-div">
                                    <div className={columnIndex == 1 || columnIndex == 2 ? 'table-div-table horizontal-chairs' : 'table-div-table vertical-chairs'}
                                        onClick={() => selectedTableNo.value = tableNo}
                                        style={{ background: tables.value.find(item => item.tableNo == tableNo)?.status == 1 ? green : '' }}>
                                        <span className='table-no'>{tableNo}</span>
                                        {[...new Array(4)].map((_, chairIndex) => <div className={"chair chair-" + (chairIndex + 1)} key={chairIndex} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const OrdersSection = () => {
        const updateOrderItemStatusToReady = async (_id) => {
            if (orders.find(order => order._id == _id).status == '1') return;

            const update = await usePostRequest('/update-order-item-status-to-ready', { _id })
            if (update.success) refetchOrderItems()
            else alert(update.msg)
        }

        return (
            <div className='orders-section'>
                <div className='orders-section-top-div'>
                    <h3>{`Orders (${orders?.length})`}</h3>
                </div>
                <div className="orders">
                    {orders?.map((order, orderIndex) =>
                        <div className="order" style={{ border: orderIndex == orders.length - 1 ? '0' : '' }} key={orderIndex}>
                            <img src={`/images/${order.name}.jpg`} />
                            <div>
                                <div>
                                    <span className="table-no">{`T-${order.tableNo}`}</span>
                                    <span className={order.status == '0' ? 'status preparing' : order.status == '1' ? 'status ready' : 'status canceled'}>
                                        {order.status == '0' ? 'Preparing' : order.status == '1' ? 'Ready' : 'Canceled'}
                                    </span>
                                </div>
                                <div>
                                    <span className="order-item-name">{`${order.name} x ${order.quantity}`}</span>
                                    {user.value.role == 'cheff' && <i className="fa-solid fa-check small-btn" onClick={() => updateOrderItemStatusToReady(order._id)} />}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    if (!user.value) return <span className="page-msg-span">You have to log in to access this page</span>

    return (
        <div className="orders-page container">
            <TablesSection />
            <OrdersSection />
            {selectedTableNo.value != -1 && <TableInfoDiv tableNo={selectedTableNo} tables={tables} orders={orders.filter(order => order.tableNo == selectedTableNo.value)} refetchOrderItems={refetchOrderItems} />}
        </div>
    )
}