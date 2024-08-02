export default function Form({ formHeaderTitle, buttonText, formBodyFields, closeBtnFunction, formMsg, submitFunction }) {
    const handleSubmit = (e) => {
        e.preventDefault()
        submitFunction(e)
    }

    return (
        <form className="form-template" onSubmit={handleSubmit}>
            <div className="form-header">
                <h3>{formHeaderTitle}</h3>
                {closeBtnFunction && <i className="fa-solid fa-xmark close-btn" onClick={() => closeBtnFunction()} />}
            </div>
            <div className="form-body">
                {formBodyFields.map((field, fieldIndex) =>
                    <div className="form-body-item" key={fieldIndex}>
                        {field.type == 'select' ?
                            <select name={field.name}>
                                {field.options.map((option, optionIndex) => <option value={option} key={optionIndex}>{option.includes('-') ? option.replaceAll('-', ' ') : option}</option>)}
                            </select>
                            :
                            <input name={field.name} type={field.type} />
                        }
                        <span>{field.name.includes('-') ? field.name.replaceAll('-', ' ') : field.name}</span>
                    </div>
                )}
            </div>
            <span className="form-msg">{formMsg}</span>
            <button className="submit-btn" type="submit">{buttonText}</button>
        </form>
    )
}

/*
<Form formHeaderTitle='' buttonText='' formMsg={} submitFunction={}
    closeBtnFunction={}
    formBodyFields={[{ name: 'name', type: 'text' }, { name: 'lastname', type: 'text' }]} />
*/