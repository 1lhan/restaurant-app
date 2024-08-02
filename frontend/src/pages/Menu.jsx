import { useSignal } from "@preact/signals-react"
import { useFormatDate, usePostRequest } from "../utils"
import { useQuery } from "@tanstack/react-query"
import Form from "../components/Form"
import Table from "../components/Table"

export default function Menu({ user }) {
    const showAddMenuItemForm = useSignal(false)
    const showMenuItemDetails = useSignal(-1)

    const { data: menu, refetch: refetchMenu } = useQuery({
        queryKey: ['getMenu'],
        queryFn: async () => {
            let getMenu = await fetch(import.meta.env.VITE_REACT_APP_BACKEND_URL + '/get-menu').then(res => res.json())
            if (!getMenu || !getMenu.success) console.log('Menu could not be fetched')
            return getMenu.success ? getMenu.menu : []
        }
    })

    const RightSide = () => {
        return (
            <div className="right-side">
                {showAddMenuItemForm.value && <AddMenuItemForm />}
                {showMenuItemDetails.value != -1 && <MenuItemDetailsDiv />}
            </div>
        )
    }

    const AddMenuItemForm = () => {
        const formMsg = useSignal('')

        const addMenuItem = async (e) => {
            e.preventDefault()

            const { name, price, type } = e.target

            if (name.value.length == 0) return formMsg.value = 'New menu item name could not be empty'
            else if (price.value <= 0) return formMsg.value = 'Price must be greater than 0'
            else if (type.value == '') return formMsg.value = 'New menu item type has not been chosen'

            let formValues = { name: name.value, price: +price.value, type: type.value, date: new Date() }
            const _postData = await usePostRequest('/add-menu-item', formValues)

            if (_postData.success) {
                e.target.reset()
                refetchMenu()
            }
            else formMsg.value = _postData.msg
        }

        return (
            <Form formHeaderTitle='Add Menu Item' buttonText='Add Menu Item' formMsg={formMsg} submitFunction={addMenuItem}
                closeBtnFunction={() => { showAddMenuItemForm.value = false }}
                formBodyFields={[{ name: 'name', type: 'text' }, { name: 'price', type: 'number' }, { name: 'type', type: 'select', options: ['', 'pan-fried-fish', 'grilled-fish', 'salad'] }]} />
        )
    }

    const MenuItemDetailsDiv = () => {
        const deleteMenuItem = async () => {
            if (!confirm('Are you sure you want delete the menu item')) return false

            const _delete = await usePostRequest('/delete-menu-item', { id: menu[showMenuItemDetails]._id })

            if (_delete.success) {
                showMenuItemDetails.value = -1
                refetchMenu()
            }
            else alert('The menu item could not be deleted')
        }

        const updateMenuItemPrice = async (e) => {
            e.preventDefault()

            let price = e.target.price.value
            if (!confirm(`Are you sure you want to update the price to ${price},\nMenu item name: ${menu[showMenuItemDetails].name}`)) return false

            let currentPrice = menu[showMenuItemDetails].price[0].price

            if (price == currentPrice) return alert("The new price and current price are the same")
            else if (price <= 0) return alert('The new price must be greater than 0')
            else {
                let _update = await usePostRequest('/update-menu-item-price', { id: menu[showMenuItemDetails]._id, price, date: new Date() })
                if (_update.success) refetchMenu()
                else alert("The price could not be updated")
            }
        }

        return (
            <div className="menu-item-details-div">
                <i className="fa-solid fa-xmark small-btn" onClick={() => showMenuItemDetails.value = -1} />
                <img src={`/images/${menu[showMenuItemDetails].name}.jpg`} />
                <span className="name">{menu[showMenuItemDetails].name}</span>
                <div className="menu-item-price-update-history-table-wrapper">
                    <span>Price Update History Table</span>
                    <Table className='menu-item-price-update-history-table' fieldNames={['date', 'price']} showIndex={false} showImage={false} onClickBtnFunction={null}
                        data={menu[showMenuItemDetails].price.map(item => ({ ...item, date: useFormatDate(item.date).slice(0.10) }))} />
                </div>
                <form className="update-price-form" onSubmit={updateMenuItemPrice}>
                    <span>Update Price</span>
                    <input name="price" type="number" />
                    <button type="submit">Update Price</button>
                </form>
                <button className="btn red-btn" onClick={() => deleteMenuItem()}>
                    <i className="fa-regular fa-trash-can" />
                    <span>Delete Menu Item</span>
                </button>
            </div>
        )
    }

    if (user.value.role != 'manager' && user.value.role != 'waiter') return <span className="page-msg-span">You don't have access to this page</span>

    return (
        <div className="menu-page container">

            <div className="left-side">
                <div className="menu-page-header">
                    <h3>Menu</h3>
                    <button className="btn" onClick={() => { showMenuItemDetails.value = -1; showAddMenuItemForm.value = !showAddMenuItemForm.value }}>
                        <i className="fa-solid fa-plus" />
                        <span>Add Menu Item</span>
                    </button>
                </div>

                {menu && <Table className='menu-table' fieldNames={['name', 'type', 'price']} showIndex={true} showImage={true} onClickBtnFunction={(index) => { showMenuItemDetails.value = index }}
                    data={menu.map(menuItem => ({ ...menuItem, price: menuItem.price[0].price }))} />}
            </div>

            <RightSide />
        </div>
    )
}