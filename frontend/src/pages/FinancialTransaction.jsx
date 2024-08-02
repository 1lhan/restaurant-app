import { batch, useSignal } from "@preact/signals-react";
import Form from "../components/Form";
import { calculateLastDayOfMonth, useFormatDate, usePostRequest } from "../utils";
import { useQuery } from "@tanstack/react-query";
import Table from "../components/Table";

export default function FinancialTransaction({ user }) {
    const showEnterTransactionForm = useSignal(false)
    const showTransactionDetail = useSignal('-1')
    const dateFilterStartDate = useSignal(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`)
    const dateFilterEndDate = useSignal(calculateLastDayOfMonth())

    const { data: transactions, refetch: refetchTransactions } = useQuery({
        queryKey: ['getTransactions'],
        queryFn: async () => {
            let _transactions = await fetch(import.meta.env.VITE_REACT_APP_BACKEND_URL + `/get-financial-transactions/${dateFilterStartDate}/${dateFilterEndDate}`).then(res => res.json())
            return _transactions.success ? _transactions.transactions : []
        }
    })

    const TransactionsSection = () => {
        return (
            <>
                {['expense', 'income'].map((sectionName, sectionIndex) =>
                    <div className='section-item' key={sectionIndex}>
                        <div className="section-header">
                            <i className={`fa-solid fa-arrow-${sectionIndex == 1 ? 'down' : 'up'}`} />
                            <h4>{sectionName}</h4>
                        </div>
                        {transactions &&
                            <Table className='transaction-table' showImage={false} showIndex={false} fieldNames={['date', 'category', 'amount', 'description']}
                                onClickBtnFunction={(_, id) => { batch(() => { showEnterTransactionForm.value = false; showTransactionDetail.value = id }) }}
                                data={transactions.filter(transaction => transaction.transactionType == sectionIndex).map(transaction => ({ ...transaction, date: useFormatDate(transaction.date).slice(0, 10) }))} />
                        }
                    </div>
                )}
            </>
        )
    }

    const EnterTransactionForm = () => {
        const formmsg = useSignal('')

        const enterTransaction = async (e) => {
            let { ['transaction-type']: { value: transactionType }, category: { value: category }, amount: { value: amount }, description: { value: description }, date: { value: date } } = e.target.elements
            if (transactionType == '') formmsg.value = 'The transaction type can not be empty'
            else if (category == '') formmsg.value = 'The category can not be empty'
            else if (amount == '') formmsg.value = 'The amount can not be empty'
            else if (description.length > 20) formmsg.value = 'The description length must be less than 20'
            else {
                let _post = await usePostRequest('/enter-financial-transaction',
                    { transactionType, category, amount: amount.includes(',') ? +amount.replaceAll(',', '.') : +amount, description, date: date == '' ? new Date() : date })
                if (_post.success) {
                    e.target.reset()
                    formmsg.value = ''
                    refetchTransactions()
                }
                else formmsg.value = _post.msg || 'The transaction could not be saved'
            }
        }

        return (
            <>
                {showEnterTransactionForm.value &&
                    <Form formHeaderTitle='Enter Transaction' buttonText='Enter Transaction' formMsg={formmsg} submitFunction={enterTransaction}
                        closeBtnFunction={() => { showEnterTransactionForm.value = false }}
                        formBodyFields={[
                            { name: 'transaction-type', type: 'select', options: ['', 'income', 'expense'] },
                            { name: 'category', type: 'select', options: ['', 'sales', 'invoice', 'supplies', 'equipment', 'salary', 'other'] },
                            { name: 'amount', type: 'number' }, { name: 'description', type: 'text' }, { name: 'date', type: 'date' }
                        ]} />}
            </>
        )
    }

    const TransactionDetailSection = () => {
        const deleteTransaction = async () => {
            if (!confirm('Are you sure you want delete the transaction')) return false

            let _delete = await usePostRequest('/delete-transaction', { _id: showTransactionDetail })
            if (_delete.success) {
                showTransactionDetail.value = '-1'
                refetchTransactions()
            }
            else console.log('The transaction could not be deleted')
        }

        return (
            <>
                {showTransactionDetail.value != -1 &&
                    <div className="transaction-details-div">
                        <div className="close-btn-wrapper">
                            <i className="fa-solid fa-xmark small-btn" onClick={() => showTransactionDetail.value = '-1'} />
                        </div>
                        <div className="div-content">
                            {['date', 'category', 'amount', 'description'].map((field, index) =>
                                <div className="transaction-details-item" key={index}>
                                    <span>{field}</span>
                                    <span>{field == 'date' ? useFormatDate(transactions.find(transaction => transaction._id == showTransactionDetail)[field]).slice(0, 10) :
                                        transactions.find(transaction => transaction._id == showTransactionDetail)[field]}</span>
                                </div>
                            )}
                            <button className="btn red-btn" onClick={() => deleteTransaction()}>
                                <i className="fa-regular fa-trash-can" />
                                <span>Delete Transaction</span>
                            </button>
                        </div>
                    </div>
                }
            </>
        )
    }

    if (user.value.role != 'manager' && user.value.role != 'waiter') return <span className="page-msg-span">You don't have access to this page</span>

    return (
        <div className="financial-transaction-page container">
            <div className="page-header">
                <h3>Financial Transaction</h3>
                <div className="date-filter">
                    <input type="date" value={dateFilterStartDate.value} onChange={(e) => { dateFilterStartDate.value = e.target.value; refetchTransactions() }} />
                    <input type="date" value={dateFilterEndDate.value} onChange={(e) => { dateFilterEndDate.value = e.target.value; refetchTransactions() }} />
                </div>
                <div className="button-wrapper">
                    <button className="btn" onClick={() => { showTransactionDetail.value = '-1'; showEnterTransactionForm.value = true }}><span>Enter Transaction</span></button>
                </div>
            </div>

            <section>
                <TransactionsSection />
                <aside>
                    <EnterTransactionForm />
                    <TransactionDetailSection />
                </aside>
            </section>
        </div>
    )
}