import { batch, useSignal } from "@preact/signals-react"
import { useLoaderData } from "react-router-dom"
import { usePostRequest } from "../utils"

export default function TableInfoDiv({ tableNo, tables, orders, refetchOrderItems }) {
    const table = useSignal(JSON.parse(localStorage.getItem('tables'))[tableNo - 1])
    const menu = useLoaderData()
    const newTableObject = { status: 0, tableNo: tableNo.value, tableOpeningTime: null, tableClosingTime: null, bill: 0, orders: [], paymentMethod: 'cash', discount: 0 }

    const cancelOrderItem = async (orderId, orderItemName) => {
        if (!confirm(`Are you sure you want cancel order item, order item name: ${orderItemName}`)) return false

        let selectedOrderIndex = table.value.orders.findIndex(item => item.name == orderItemName)
        let _orders = JSON.parse(JSON.stringify(table.value.orders))
        _orders[selectedOrderIndex].quantity == 1 ? _orders.splice(selectedOrderIndex, 1) : _orders[selectedOrderIndex].quantity -= 1
        document.getElementById(`${orderItemName}-quantity-input`).value -= 1

        batch(() => {
            table.value = { ...table.value, orders: _orders }
            tables.value[tableNo.value - 1] = table.value.orders.length == 0 ? newTableObject : table.value
            localStorage.setItem('tables', JSON.stringify(tables.value))
        })

        let _cancelOrder = await usePostRequest('/cancel-order', { orderId })
        if (!_cancelOrder || !_cancelOrder.success) console.log('Order could not be canceled in database')
        else refetchOrderItems()
    }

    const updateOrderItems = async () => {
        if (table.value.orders.length == 0) { tableNo.value = -1; return false }

        // veri tabanından siparişlerin alınması ve status'ü preparing olanların ve tableNo'su seçili table'ın no'su ile aynı olanları filtrelenmesi
        let placedOrders = await fetch(import.meta.env.VITE_REACT_APP_BACKEND_URL + '/get-order-items').then(res => res.json())
        if (!placedOrders.success) return console.log('Orders could not be fetched')
        placedOrders = placedOrders.orderItems.filter(item => item.tableNo == tableNo && item.status == '0')

        /* _currentOrders adlı bir array değişken oluşturulur ve bu değişkene table.value.orders'ın kopyası atanır. Bu değişken düzenlenerek(1) array elemanları newOrders array'ine pushlanır.
        (1) örnek : (_currentOrders) [{name: 'Alabalık Tava', quantity: 2}] => (newOrders) [{name: 'Alabalık Tava', quantity: 1}, {name: 'Alabalık Tava', quantity: 1}]
        hem newOrders (masa bilgi div'ini kapamadan önceki masanın siparişlerinin son durumu) array'inde olup hem de placedOrders (masanın sipariş verdiği ve veri tabanına kaydedilen siparişler) array'inde olan
        siparişler newOrders array'inden silinir; Böylece newOrders array'inde yeni söylenen ve veri tabanına kaydedilmesi gereken siparişler kalır ve bu siparişler de backend'e gönderilir. */
        let newOrders = []
        let _currentOrders = JSON.parse(JSON.stringify(table.value.orders))
        for (let i in _currentOrders) {
            for (let j = 0; j < +_currentOrders[i].quantity; j++) {
                newOrders.push({ name: _currentOrders[i].name, quantity: 1, tableNo: tableNo.value, status: '0' })
            }
        }
        placedOrders.forEach(item => {
            let _index = newOrders.findIndex(orderItem => orderItem.name == item.name)
            newOrders.splice(_index, 1)
        })

        let updateOrders = await usePostRequest('/update-orders', newOrders)
        if (!updateOrders.success) console.log('Orders could not be updated')
        else refetchOrderItems()

        if (table.value.status == 0) { table.value.status = '1'; table.value.tableOpeningTime = new Date() }

        batch(() => {
            tables.value[table.value.tableNo - 1] = table.value
            localStorage.setItem('tables', JSON.stringify(tables.value))
            tableNo.value = -1
        })
    }

    const changeQuantity = (e, menuItemName, actionType) => {
        let _orders = JSON.parse(JSON.stringify(table.value.orders))
        let _orderItemId = _orders.findIndex(item => item.name == menuItemName)
        let _input = e.target.parentElement.children[1]

        if (actionType == 'increase') {
            _input.value = +_input.value + 1;
            _orderItemId == -1 ? _orders.push({ name: menuItemName, quantity: +_input.value }) : _orders[_orderItemId].quantity = _input.value
        }
        else {
            let _savedOrderItemQuantity = tables.value[table.value.tableNo - 1].orders.find(item => item.name == menuItemName)?.quantity || 0

            if (_input.value > 0 && (_input.value > _savedOrderItemQuantity || _savedOrderItemQuantity == 0)) {
                _input.value = +_input.value - 1;
                _input.value == 0 ? _orders.splice(_orderItemId, 1) : _orders[_orderItemId].quantity = _input.value
            }
        }

        table.value = { ...table.value, orders: _orders }
    }

    const closeTable = async (e) => {
        e.preventDefault()

        if (!confirm(`Are you sure you want to close TABLE ${table.value.tableNo}`)) return false

        let { discount, paymentMethod } = e.target
        console.log(calculateTotalAmount() - (calculateTotalAmount() - +discount.value))
        let _table = { ...table.value, bill: calculateTotalAmount() - (+discount.value == 0 ? 0 : (calculateTotalAmount() - +discount.value)), tableClosingTime: new Date(), paymentMethod: paymentMethod.value }

        if (+discount.value > _table.bill) return console.log('Total amount after discount can not be greater than total amount')
        else _table.discount = +discount.value == 0 ? 0 : calculateTotalAmount() - +discount.value

        let saveTable = await usePostRequest('/save-table-data', _table)
        if (!saveTable.success) console.log('Table data could not be saved')

        batch(() => {
            tables.value[tableNo.value - 1] = newTableObject
            localStorage.setItem('tables', JSON.stringify(tables.value))
            tableNo.value = -1
        })
    }

    const cancelTable = async (_tableNo) => {
        if (!confirm(`Are you sure you want cancel TABLE ${_tableNo}`)) return false

        batch(() => {
            tables.value[_tableNo - 1] = { ...newTableObject, tableNo: _tableNo }
            tableNo.value = -1
        })
        localStorage.setItem('tables', JSON.stringify(tables.value))

        let _cancelTable = await usePostRequest('/cancel-table', { tableNo: _tableNo })
        if (!_cancelTable.success) console.log(_cancelTable.msg)
        else refetchOrderItems()
    }

    const calculateTotalAmount = () => {
        let _totalAmount = table.value.orders.reduce((t, c) => { return t + (+c.quantity * +menu.find(menuItem => menuItem.name == c.name)?.price[0].price) }, 0)
        return _totalAmount
    }

    return (
        <div className="table-info-div">
            <div className="top-div">
                <h3>{`Table ${tableNo}`}</h3>
                <i className="fa-solid fa-xmark close-div-btn" onClick={() => updateOrderItems()} />
            </div>
            <div className="inner-div">
                <div className="inner-div-left-side">

                    <div className="menu">
                        {menu.map((menuItem, menuItemIndex) =>
                            <div className="menu-item" key={menuItemIndex}>
                                <img src={`/images/${menuItem.name}.jpg`} />
                                <span className="name">{menuItem.name}</span>
                                <span className="price">{menuItem.price[0].price}</span>
                                <div className='quantity-div'>
                                    <button onClick={(e) => changeQuantity(e, menuItem.name, 'decrease')}>-</button>
                                    <input id={`${menuItem.name}-quantity-input`} name='quantity' type='number' disabled defaultValue={table.value.status == 1 &&
                                        (table.value.orders.findIndex(item => item.name == menuItem.name) != -1) ? table.value.orders.find(item => item.name == menuItem.name).quantity : 0} />
                                    <button onClick={(e) => changeQuantity(e, menuItem.name, 'increase')}>+</button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
                <div className="inner-div-right-side">

                    <div className="orders">
                        {table.value.orders.length > 0 && table.value.orders.map((orderItem, orderItemIndex) =>
                            <div className="order-item" style={{ border: orderItemIndex == table.value.orders.length - 1 ? '0' : '' }} key={orderItemIndex}>
                                <div className="order-item-div-top">
                                    <img src={`/images/${orderItem.name}.jpg`} />
                                    <div>
                                        <span className="name">{orderItem.name}</span>
                                        <div>
                                            <span>
                                                <span>{menu.find(item => item.name == orderItem.name)?.price[0].price}</span>
                                                <span>{` x ${orderItem.quantity}`}</span>
                                            </span>
                                            <span className="order-item-total-price">{+menu.find(item => item.name == orderItem.name)?.price[0].price * +orderItem.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="order-item-div-bottom">
                                    {orders.filter(order => order.name == orderItem.name).map((_orderItem, _orderItemIndex) =>
                                        <div className="order-status-info" key={_orderItemIndex}>
                                            <span className={_orderItem.status == '0' ? 'status preparing' : _orderItem.status == '1' ? 'status ready' : 'status canceled'}>
                                                {_orderItem.status == '0' ? 'Preparing' : _orderItem.status == '1' ? 'Ready' : 'Canceled'}
                                            </span>
                                            <span className="quantity">{` x ${_orderItem.quantity}`}</span>
                                            <button className="order-cancel-btn" onClick={() => cancelOrderItem(_orderItem._id, _orderItem.name)}>
                                                <i className="fa-solid fa-xmark close-div-btn" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <form className="table-payment-section" onSubmit={closeTable}>
                        <div className="total-amount">
                            <span>Total Amount</span>
                            <span>{calculateTotalAmount()}</span>
                        </div>
                        <hr />
                        <div className="discount">
                            <span>Total amount after discount</span>
                            <input className="discount-input" name="discount" type="number" defaultValue={0} />
                        </div>
                        <hr />
                        <div className="payment-method">
                            <span>Payment Method</span>
                            <label>
                                <input type="radio" name="paymentMethod" value='cash' defaultChecked={true} />
                                <i className="fa-solid fa-money-bill" />
                            </label>
                            <label>
                                <input type="radio" name="paymentMethod" value='credit-card' />
                                <i className="fa-regular fa-credit-card" />
                            </label>
                        </div>
                        <hr />
                        <div className="buttons">
                            <button className="btn red-btn" type="button" onClick={() => cancelTable(table.value.tableNo)}>
                                <i className="fa-solid fa-xmark" />
                                <span>Cancel Table</span>
                            </button>
                            <button className="btn" type="submit">
                                <i className="fa-solid fa-check" />
                                <span>Close Table</span>
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    )
}