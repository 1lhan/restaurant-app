import React from 'react'
import ReactDOM from 'react-dom/client'
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { signal } from '@preact/signals-react'

import Navbar from './components/Navbar'
import Orders from './pages/Orders'
import Menu from './pages/Menu'
import Staff from './pages/Staff'
import DataAnalysis from './pages/DataAnalysis'
import FinancialTransaction from './pages/FinancialTransaction'
import Home from './pages/Home'

import './style/style.css'
import './style/pieChartStyle.css'
import './style/templatesStyle.css'
import ManagerActions from './pages/ManagerActions'


const autoLogin = async () => {
    let _autoLogin = await fetch(import.meta.env.VITE_REACT_APP_BACKEND_URL + '/auto-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: document.cookie })
    }).then(res => res.json())

    return _autoLogin.success ? _autoLogin.user : false
}
const user = signal(await autoLogin())

const getMenu = async () => {
    let getMenu = await fetch('http://localhost:5000/get-menu').then(res => res.json())
    if (!getMenu || !getMenu.success) console.log('Menu could not be fetched')
    return getMenu.success ? getMenu.menu : []
}

const mainFunction = async () => {
    let _tables = JSON.parse(localStorage.getItem('tables'))
    if (_tables == null) {
        let __tables = []
        for (let i = 1; i <= 12; i++) { __tables.push({ status: 0, tableNo: i, tableOpeningTime: null, tableClosingTime: null, bill: 0, orders: [], paymentMethod: 'cash', discount: 0 }) }
        localStorage.setItem('tables', JSON.stringify(__tables))
    }
}
mainFunction()

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false
        }
    }
})

const router = createBrowserRouter([
    {
        element: <><Navbar user={user} /><Outlet /></>,
        children: [
            {
                path: '/',
                element: <Home />
            },
            {
                path: '/orders',
                element: <Orders user={user} />,
                loader: getMenu
            },
            {
                path: '/menu',
                element: <Menu user={user} />
            },
            {
                path: '/staff',
                element: <Staff user={user} />
            },
            {
                path: '/data-analysis',
                element: <DataAnalysis user={user} />
            },
            {
                path: '/financial-transaction',
                element: <FinancialTransaction user={user} />
            },
            {
                path: '/manager-actions',
                element: <ManagerActions user={user} />
            }
        ]
    }
])

ReactDOM.createRoot(document.getElementById('root')).render(
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
    </QueryClientProvider>
)