import { NavLink, useNavigate } from 'react-router-dom'
import Form from './Form'
import { batch, useSignal } from '@preact/signals-react'
import { usePostRequest } from '../utils'

export default function Navbar({ user }) {
    const showLoginPopUp = useSignal(false)
    const loginFormMsg = useSignal('')
    const navigate = useNavigate()

    const login = async (e) => {
        e.preventDefault()

        let { username, password } = e.target

        if (username.value.length < 2) loginFormMsg.value = 'Username length can be atleast 2'
        else if (password.value.length < 8) loginFormMsg.value = 'Password length can be atleast 8'
        else {
            let _login = await usePostRequest('/login', { username: username.value, password: password.value })

            if (_login.success) {
                let date = new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)).toUTCString()
                let token = `token=${_login.token}; expires=${date};  path=/;`
                document.cookie = token

                batch(() => {
                    user.value = _login.user
                    showLoginPopUp.value = false
                    loginFormMsg.value = ''
                })
                navigate('/')
            }
            else loginFormMsg.value = _login.msg
        }
    }

    const logout = () => {
        if (!confirm('Are you sure you want to log out ?')) return false

        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        user.value = false
        navigate('/')

    }

    const NavbarLoginSection = () => {
        return (
            <div className='navbar-login-section'>
                {user.value ?
                    <div className='user-btn'>
                        <span className='first-letter-of-username'>{user.value.username.slice(0, 1)}</span>
                        <span className='username'>{user.value.username}</span>
                        <i className="fa-solid fa-arrow-right-from-bracket" onClick={() => logout()} />
                    </div>
                    :
                    <button className='show-login-form-btn' onClick={() => showLoginPopUp.value = true}>
                        <i className="fa-solid fa-arrow-right-to-bracket" />
                        <span>Log in</span>
                    </button>
                }
                {showLoginPopUp.value && <Form formHeaderTitle='Log in' buttonText='Log in' formMsg={loginFormMsg} submitFunction={login}
                    closeBtnFunction={() => showLoginPopUp.value = false} formBodyFields={[{ name: 'username', type: 'text' }, { name: 'password', type: 'password' }]} />}
            </div>
        )
    }

    return (
        <div className='navbar'>
            {
                [
                    { name: 'orders', icon: 'fa-solid fa-bell-concierge' }, { name: 'menu', icon: 'fa-solid fa-utensils' }, { name: 'staff', icon: 'fa-solid fa-users' },
                    { name: 'financial-transaction', icon: 'fa-solid fa-money-bill-transfer' }, { name: 'data-analysis', icon: 'fa-solid fa-chart-line' }, { name: 'manager-actions', icon: "fa-solid fa-lock" }
                ]
                    .map((navbarItem, navbarItemIndex) =>
                        <NavLink to={`/${navbarItem.name}`} className="nav-item" key={navbarItemIndex}>
                            <i className={navbarItem.icon} />
                            <span>{navbarItem.name.includes('-') ? navbarItem.name.replaceAll('-', ' ') : navbarItem.name}</span>
                        </NavLink>
                    )
            }
            <NavbarLoginSection />
        </div >
    )
}