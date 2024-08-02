import { useSignal } from "@preact/signals-react"

export default function ColumnChart({ title, data, primaryKey, secondaryKey }) {
    const leftSideValues = useSignal([])
    const toolTipValue = useSignal(false)

    const dataHandler = () => {
        let sortedDataHighToLow = data.slice().sort((a, b) => b[primaryKey] - a[primaryKey])
        let maxValue = sortedDataHighToLow[0][primaryKey]
        let _leftSideValues = []
        let leftSideMaxValue

        // 5 * (10 üzeri (data içindeki max değerin karakter uzunluğu - 2)) değeri i ile çarpılır ve bu değer maxValue'dan büyük olduğu an for döngüsü durur
        for (let i = 1; i > 0; i++) {
            let _value = 5 * Math.pow(10, String(maxValue).length - 2) * i
            if (_value > maxValue) { leftSideMaxValue = _value; break; }
        }

        // leftSideMaxValue değeri 5 parçaya bölünür
        for (let i = 1; i <= 5; i++) {
            _leftSideValues.push((leftSideMaxValue / 5) * i)
        }

        for (let i in data) {
            data[i].height = (data[i][primaryKey] / _leftSideValues[_leftSideValues.length - 1]) * 100
        }

        leftSideValues.value = _leftSideValues
        console.log(_leftSideValues)
        console.log(data)
    }
    dataHandler()

    const ToolTip = () => {
        return (
            <>
                {toolTipValue.value &&
                    <div className="tool-tip" style={{ left: `calc(${(((100 - (data.length - 1)) / 7) * (toolTipValue.value.index + 0.5)) + (toolTipValue.value.index * 1)}%` }}>
                        <div className="tool-tip-inner">
                            <span className="tool-tip-arrow" />
                            <div>
                                <span>{secondaryKey}</span>
                                <span>{toolTipValue.value.secondaryKey}</span>
                            </div>
                            <div>
                                <span>{primaryKey}</span>
                                <span>{toolTipValue.value.primaryKey}</span>
                            </div>
                        </div>
                    </div>
                }
            </>
        )
    }

    return (
        <div className="column-chart-container">
            <span className="title">{title}</span>
            <div className="chart-body">

                <div className="left-side-values">
                    <div className="left-side-values-inner">
                        {leftSideValues.value.reverse().map((value, index) =>
                            <div key={index}>
                                <span>{value}</span>
                                {index == leftSideValues.value.length - 1 && <span>0</span>}
                            </div>
                        )}
                    </div>
                    <span className="hidden-span">{leftSideValues.value[0]}</span>
                </div>

                <div className="chart-body-right-side">

                    <div className="chart">
                        {data.map((item, index) =>
                            <div className="value-wrapper"
                                onMouseOver={() => toolTipValue.value = { index, primaryKey: item[primaryKey], secondaryKey: item[secondaryKey] }} key={index}
                                onMouseLeave={() => toolTipValue.value = false}
                            >
                                <div className="value" style={{ height: item.height + '%' }} />
                            </div>
                        )}
                        <div className="chart-back-lines">
                            {[...Array(5)].map((_, lineIndex) =>
                                <span className="back-line" key={lineIndex} />
                            )}
                        </div>
                        <ToolTip />
                    </div>

                    <div className="secondary-keys">
                        {data.map((item, index) =>
                            <span key={index}>{item[secondaryKey]}</span>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}