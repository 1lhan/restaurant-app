export default function CustomSelect({ id, state, func, options }) {

    const onClickOption = (_value) => {
        state.value = _value
        document.getElementById(id).checked = false
        if (func) func()
    }

    return (
        <div className="custom-select">
            <input id={id} type="checkbox" />
            <label htmlFor={id}>
                <span className="state-value">{state.value.includes('-') ? state.value.replaceAll('-', ' ') : state.value}</span>
                <span className="hidden">{options.slice().sort((a, b) => b.length - a.length)[0]}</span>
                <i className="fa-solid fa-chevron-down" />
            </label>
            <div className="options">
                {options.map((option, optionIndex) =>
                    <button onClick={() => onClickOption(option)} disabled={state.value == option} key={optionIndex}>
                        {option.includes('-') ? option.replaceAll('-', ' ') : option}
                    </button>
                )}
            </div>
        </div>
    )
}