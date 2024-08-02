import { useSignal } from "@preact/signals-react"

export default function PieChart({ chartTitle, data, primaryKey, secondaryKey, middleCircleText }) {
    const total = useSignal('')

    const dataHandler = () => {
        data.sort((a, b) => b[primaryKey] - a[primaryKey])

        let _totalCount = data.reduce((t, c) => { return t + c[primaryKey] }, 0)
        total.value = _totalCount

        for (let i in data) {
            data[i].deg = (360 * (data[i][primaryKey] / _totalCount))
            data[i].percentage = `${((data[i][primaryKey] / _totalCount) * 100).toFixed(0)}%`
            data[i].fromDeg = i == 0 ? 0 : data[i - 1].deg + data[i - 1].fromDeg
        }
    }
    dataHandler()

    const colors = ['#3b82f6', '#fb923c', '#a78bfa', '#fcd34d', '#a3e635', '#22d3ee', '#4ade80', '#bfdbfe', '#ec4899', '#f43f5e', '#d946ef', '#fef08a']

    return (
        <div className="pie-chart-container">
            <div className="chart-title">
                <span>{chartTitle}</span>
            </div>
            <div className="pie-chart">
                {[...Array(data.length)].map((_, sliceIndex) =>
                    <div className="slice" key={sliceIndex}
                        style={{ background: `conic-gradient(from ${data[sliceIndex].fromDeg}deg at 50%, ${colors[sliceIndex]} 0deg ${data[sliceIndex].deg}deg, transparent ${data[sliceIndex].deg}deg 360deg)` }} >
                    </div>
                )}
                <div className="middle-circle">
                    <span>{total}</span>
                    <span>{middleCircleText}</span>
                </div>
            </div>
            <div className="pie-chart-info-section">
                {data.map((item, index) =>
                    <div key={index}>
                        <span className="color" style={{ background: colors[index] }} />
                        <span className="secondary-key">{item[secondaryKey].includes('-') ? item[secondaryKey].replaceAll('-', ' ') : item[secondaryKey]}</span>
                        <span className="primary-key">{`${item[primaryKey]} (${item.percentage})`}</span>
                    </div>
                )}
            </div>
        </div>
    )
}