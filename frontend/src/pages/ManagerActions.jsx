import { batch, useSignal } from "@preact/signals-react"
import Form from "../components/Form"
import { usePostRequest } from "../utils"
import Table from "../components/Table"
import { useQuery } from "@tanstack/react-query"

export default function ManagerActions({ user }) {
    const showCreateAccountForm = useSignal(false)
    const createAccountFormMsg = useSignal('')
    const showAccountDetails = useSignal(-1)
    const changePasswordFormMsg = useSignal('')

    const { data: accounts, refetch: refetchAccounts } = useQuery({
        queryKey: ['getAccounts'],
        queryFn: async () => {
            let _accounts = await fetch(import.meta.env.VITE_REACT_APP_BACKEND_URL + '/get-accounts').then(res => res.json())
            return _accounts.success ? _accounts.accounts : []
        }
    })

    const createAccount = async (e) => {
        let { username: { value: username }, password: { value: password }, role: { value: role } } = e.target.elements

        if (username.length == 0) createAccountFormMsg.value = 'The username can not be empty'
        else if (password.length <= 7) createAccountFormMsg.value = 'The password length must be more than 7'
        else if (role == '') createAccountFormMsg.value = 'The role can not be empty'
        else {
            let create = await usePostRequest('/register', { username, password, role })

            if (create.success) {
                e.target.reset()
                createAccountFormMsg.value = ''
                refetchAccounts()
            }
            else createAccountFormMsg.value = create.msg
        }
    }

    const changePassword = async (e) => {
        let { ['current-password']: { value: currentPassword }, ['new-password']: { value: newPassword }, ['new-password-again']: { value: newPasswordAgain } } = e.target.elements

        if (currentPassword.length < 8) changePasswordFormMsg.value = 'The current password length must be greater than 7'
        else if (newPassword.length < 8) changePasswordFormMsg.value = 'The new password length must be greater than 7'
        else if (newPassword != newPasswordAgain) changePasswordFormMsg.value = 'The new passwords are not same'
        else {
            let change = await usePostRequest('/update-password', { userId: accounts[showAccountDetails.value]._id, currentPassword, newPassword })

            if (change.success) {
                e.target.reset()
                refetchAccounts()
            }
            changePasswordFormMsg.value = change.msg
        }
    }

    const deleteAccount = async () => {
        if (!confirm('Are you sure you want to delete the account ?')) return;

        let response = await usePostRequest('/delete-account', { userId: accounts[showAccountDetails.value]._id })
        if (response.success) {
            showAccountDetails.value = -1
            refetchAccounts()
        }
        else alert(response.msg)
    }

    const Aside = () => {
        return (
            <aside>
                {showCreateAccountForm.value && <Form formHeaderTitle='Create Account' buttonText='Create Account' closeBtnFunction={() => showCreateAccountForm.value = false}
                    formBodyFields={[{ name: 'username', type: 'text' }, { name: 'password', type: 'password' }, { name: 'role', type: 'select', options: ['', 'manager', 'cheff', 'waiter', 'busser', 'dishwasher'] }]}
                    submitFunction={createAccount} formMsg={createAccountFormMsg} />}
                {showAccountDetails.value != -1 &&
                    <div className="account-details">
                        <i className="fa-solid fa-xmark small-btn" onClick={() => { batch(() => { showAccountDetails.value = -1; changePasswordFormMsg.value = '' }) }} />
                        <div>
                            <div className="account-detail-div">
                                <span>Username</span>
                                <span>{accounts[showAccountDetails.value].username}</span>
                            </div>
                            <div className="account-detail-div">
                                <span>Role</span>
                                <span>{accounts[showAccountDetails.value].role}</span>
                            </div>
                            <hr />
                            <Form formHeaderTitle='Change Password' buttonText='Change Password' closeBtnFunction={null} formMsg={changePasswordFormMsg} submitFunction={changePassword}
                                formBodyFields={[{ name: 'current-password', type: 'password' }, { name: 'new-password', type: 'password' }, { name: 'new-password-again', type: 'password' }]} />
                            <hr />
                            <button className="btn red-btn" onClick={() => deleteAccount()}>
                                <i className="fa-regular fa-trash-can" />
                                <span>Delete Account</span>
                            </button>
                        </div>
                    </div>
                }
            </aside>
        )
    }

    if (user.value.role != 'manager') return <span className="page-msg-span">You don't have access to this page</span>

    return (
        <div className="manager-actions-page container">
            <div className="page-header">
                <h3>Manager Actions</h3>
            </div>
            <section>
                <div className="section-items">
                    <div className="section-item">
                        <div className="section-item-header">
                            <h4>Accounts</h4>
                            <button className="btn" onClick={() => { batch(() => { showCreateAccountForm.value = true; showAccountDetails.value = -1 }) }}>Create Account</button>
                        </div>
                        {accounts && <Table className='accounts-table' data={accounts} fieldNames={['username', 'role']} showImage={false} showIndex={false}
                            onClickBtnFunction={(index) => { batch(() => { showAccountDetails.value = index; showCreateAccountForm.value = false }) }} />}
                    </div>

                </div>
                <Aside />
            </section>
        </div>
    )
}