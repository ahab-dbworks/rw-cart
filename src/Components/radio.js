import React from "react";

class RadioButton extends React.Component {
    constructor(props) {
        super(props);
    }

    checkMe = (v) => {
        this.props.action(v);
    }

    render() {
        const { name, options, selected } = this.props;
        if (options.length > 0) {
            let label = undefined;
            return (
                <div className="radio-set">
                    <div className="super-label">{name}</div>
                    <ul className="radio-list">
                        {
                            options.map((option, i) => {
                                const checkedVal = selected === option.name ? "checked" : "";
                                if (option.icon) {
                                    label = <i className="">{option.icon}</i>
                                } else {
                                    label = option.label
                                }
                                return (
                                    
                                    <li
                                        key={i}
                                        onClick={() => this.checkMe(option)}
                                        className={`radio-option ${checkedVal}`}
                                    >
                                        {label}
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            )
        } else {
            return <div className="radio-set"></div>
        }
    }
}

export default RadioButton;