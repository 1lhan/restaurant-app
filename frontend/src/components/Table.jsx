export default function Table({ className, fieldNames, data, showIndex, onClickBtnFunction, showImage }) {
    const convertToKebabCase = (string) => {
        return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    }

    return (
        <div className={`table-template ${className}`}>
            <div className="field-names">
                {showIndex && <span className="id">ID</span>}
                {showImage && <span className="image">Image</span>}
                {fieldNames.map((field, fieldIndex) =>
                    <span className={`table-item ${field}`} key={fieldIndex}>{convertToKebabCase(field).includes('-') ? convertToKebabCase(field).replaceAll('-', ' ') : field}</span>
                )}
                {onClickBtnFunction && <i className="fa-solid fa-ellipsis button" />}
            </div>
            <div className="table-body">
                {data.map((data, dataIndex) =>
                    <span className="table-body-item" key={dataIndex}>
                        {showIndex && <span className="id">{dataIndex + 1}</span>}
                        {showImage && <img className="image" src={`/images/${data.name}.jpg`} />}
                        {fieldNames.map((field, fieldIndex) =>
                            <span className={`table-item ${field}`} key={fieldIndex}>{String(data[field]).includes('-') ? data[field].replaceAll('-', ' ') : data[field]}</span>
                        )}
                        {onClickBtnFunction && <i className="fa-solid fa-ellipsis button" onClick={() => onClickBtnFunction(dataIndex, className == 'transaction-table' && data._id)} />}
                    </span>
                )}
            </div>
        </div>
    )
}