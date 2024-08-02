import { useSignal } from "@preact/signals-react";
import { useQuery } from "@tanstack/react-query";
import PieChart from "../components/PieChart";
import ColumnChart from "../components/ColumnChart";
import CustomSelect from "../components/CustomSelect";

export default function DataAnalysis({ user }) {
    const months = [
        { name: 'January', value: 0 }, { name: 'February', value: 1 }, { name: 'March', value: 2 }, { name: 'April', value: 3 }, { name: 'May', value: 4 }, { name: 'June', value: 5 },
        { name: 'July', value: 6 }, { name: 'August', value: 7 }, { name: 'September', value: 8 }, { name: 'October', value: 9 }, { name: 'November', value: 10 }, { name: 'December', value: 11 }
    ]

    const selectedMonth = useSignal(months[new Date().getMonth()].name)

    const { data, refetch: refetchAnalysisData } = useQuery({
        queryKey: ['getAnalysisData'],
        queryFn: async () => {
            const _months = [
                { name: 'January', value: 0 }, { name: 'February', value: 1 }, { name: 'March', value: 2 }, { name: 'April', value: 3 }, { name: 'May', value: 4 }, { name: 'June', value: 5 },
                { name: 'July', value: 6 }, { name: 'August', value: 7 }, { name: 'September', value: 8 }, { name: 'October', value: 9 }, { name: 'November', value: 10 }, { name: 'December', value: 11 }
            ]

            let _month = _months.find(month => month.name == selectedMonth).value

            let _date = new Date()
            let _firstDay = new Date(_date.getFullYear(), _month, 1)
            let _lastDay = new Date(_date.getFullYear(), _month + 1, 1)

            let _data = await fetch(import.meta.env.VITE_REACT_APP_BACKEND_URL + `/get-analysis-data/${_firstDay}/${_lastDay}`).then(res => res.json())
            return analysisDataHandler(_data)
        }
    })

    const analysisDataHandler = (_data) => {
        let data = {
            paymentMethodCount: [{ name: 'cash', count: 0 }, { name: 'credit-card', count: 0 }],
            tableSittingCount: [],
            incomesByDay: [
                { day: 'Monday', income: 0 }, { day: 'Tuesday', income: 0 }, { day: 'Wednesday', income: 0 }, { day: 'Thursday', income: 0 }, { day: 'Friday', income: 0 }, { day: 'Saturday', income: 0 }, { day: 'Sunday', income: 0 }
            ],
            menuItemPreferences: _data.menu.map(item => ({ name: item.name, count: 0 })),
            averageSittingTime: 0,
            incomesAndExposes: [{ name: 'income', amount: 0 }, { name: 'expose', amount: 0 }]
        }

        for (let i = 1; i <= 12; i++) data.tableSittingCount.push({ tableNo: `${i}`, count: 0 })

        for (let i in _data.orders) {
            data.paymentMethodCount[_data.orders[i].paymentMethod == 'cash' ? 0 : 1].count++
            data.tableSittingCount[parseInt(_data.orders[i].tableNo) - 1].count++
            data.incomesByDay[+(new Date(_data.orders[i].tableOpeningTime).getDay())].income += _data.orders[i].bill
            data.incomesAndExposes[0].amount += _data.orders[i].bill
            data.averageSittingTime += (new Date(_data.orders[i].tableClosingTime) - new Date(_data.orders[i].tableOpeningTime)) / (1000 * 60)

            for (let j in _data.orders[i].orders) {
                let _tableOrderItem = _data.orders[i].orders[j]
                data.menuItemPreferences.find(menuItem => menuItem.name == _tableOrderItem.name).count += _tableOrderItem.quantity
            }
        }

        for (let i in _data.transactions) {
            let transaction = _data.transactions[i]

            if (transaction.transactionType == '1') data.incomesByDay[+(new Date(transaction.date).getDay())].income += transaction.amount
            data.incomesAndExposes[transaction.transactionType == '0' ? 1 : 0].amount += transaction.amount
        }

        data.averageSittingTime = (data.averageSittingTime / _data.orders.length).toFixed(2)

        return data
    }

    const Section = () => {
        return (
            <>
                {data && <section>
                    <div className="monthly-income">
                        <i className="fa-solid fa-arrow-down" />
                        <div>
                            <span className="title">Monthly Income</span>
                            <span className="value currency">{new Intl.NumberFormat('tr-TR').format(data.incomesAndExposes[0].amount)}</span>
                        </div>
                    </div>

                    <div className="monthly-expose">
                        <i className="fa-solid fa-arrow-up" />
                        <div>
                            <span className="title">Monthly Expose</span>
                            <span className="value currency">{new Intl.NumberFormat('tr-TR').format(data.incomesAndExposes[1].amount)}</span>
                        </div>
                    </div>

                    <div className="worth">
                        <i className="fa-solid fa-vault" />
                        <div>
                            <span className="title">Monthly Worth</span>
                            <span className="value currency" style={{ color: data.incomesAndExposes[0].amount - data.incomesAndExposes[1].amount > 0 ? '#34d399' : '#ff6c6c' }}>
                                {new Intl.NumberFormat('tr-TR').format(data.incomesAndExposes[0].amount - data.incomesAndExposes[1].amount)}
                            </span>
                        </div>
                    </div>

                    <div className="new-average-sitting-time">
                        <i className="fa-regular fa-clock" />
                        <div>
                            <span className="title">Average Sitting Time</span>
                            <span className="value">{`${data.averageSittingTime} min`}</span>
                        </div>
                    </div>

                    <div className="column-chart-wrapper">
                        <ColumnChart title='Incomes by day' data={data.incomesByDay} primaryKey='income' secondaryKey='day' />
                    </div>

                    <div className="pie-chart-wrapper">
                        <PieChart chartTitle='Menu Item Preferences' data={data.menuItemPreferences} primaryKey='count' secondaryKey='name' middleCircleText={'order'} />
                    </div>

                    <div className="pie-chart-wrapper">
                        <PieChart chartTitle='Payment Method Preferences' data={data.paymentMethodCount} primaryKey='count' secondaryKey='name' middleCircleText={'payment'} />
                    </div>

                    <div className="pie-chart-wrapper">
                        <PieChart chartTitle='Table Seating Preferences' data={data.tableSittingCount} primaryKey='count' secondaryKey='tableNo' middleCircleText={'table'} />
                    </div>
                </section>}
            </>
        )
    }

    if (user.value.role != 'manager') return <span className="page-msg-span">You don't have access to this page</span>

    return (
        <div className="data-analysis-page container">
            <div className="page-header">
                <h3>Data Analysis</h3>
                <CustomSelect id='select-month' state={selectedMonth} func={() => refetchAnalysisData()}
                    options={["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]} />
            </div>
            {<Section />}
        </div>
    )
}