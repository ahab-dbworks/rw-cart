import React from 'react';
import Select, { NonceProvider } from 'react-select';
import _ from 'lodash';

class SuperSelect extends Select {
    constructor(props) {
        super(props);
        this.state = {
            mode: "waiting",
            options: undefined
        }
    }

    getOptions = async () => {
        this.setState({ mode: "loading" });
        const options = await this.props.loader(this.props.filter);
        if (options) {
            switch (Object.values(options).length) {
                case 0:
                    this.setState({ mode: "empty" })
                    break;
                case 1:
                    Object.values(options).forEach(value => this.props.action(value));
                default:
                    this.setState({ mode: "display", options: options });
            }
        }
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(this.props, prevProps)) {
            if (this.props.reloadOn.includes(null)) {
                this.setState({ mode: "waiting", options: undefined });
            } else {
                this.getOptions();
            }
        }
    }

    componentDidMount() {
        if (this.props.preload) {
            this.getOptions();
        }
    }

    render() {
        const { mode, options, resetValues } = this.state;
        const { name, action, searchable, placeholder, value } = this.props;
        const customStyles = {
            option: (provided, state) => ({
                ...provided,
                color: state.isSelected ? 'white' : 'black',
            }),
            control: () => ({
                backgroundColor: 'transparent',
                display: 'flex',
            }),
            placeholder: () => ({
                color: 'rgba(255,255,255,0.75)',
                fontStyle: 'italic'
            }),
            indicatorSeparator: (provided) => ({
                ...provided,
                backgroundColor: 'rgba(255,255,255,0.75)'
            }),
            dropdownIndicator: (provided, { selectProps: { isLoading }}) => ({
                ...provided,
                color: isLoading ? 'rgba(255,255,255,0.75)' : 'white',
                "&:hover": {
                    color: ''
                },
                padding: '0.5em 0 0.5em 1em'
            }),
            singleValue: () => ({
                color: 'white',
            }),
            loadingIndicator: (provided) => ({
                ...provided,
                color: 'white'
            }),
            valueContainer: (provided) => ({
                ...provided,
                padding: 0
            })
        }
        //

        //
        let isLoading = true;
        let advPlaceholder, optionsList = null;
        const labelName = name.substring(0, 1).toUpperCase() + name.substring(1);
        switch (mode) {
            case "empty":
                advPlaceholder = "No Options"
                isLoading = false;
                break;
            case "waiting":
                advPlaceholder = "Awaiting Parameters...";
                break;
            case "loading":
                advPlaceholder = "Loading Options...";
                break;
            case "display":
                advPlaceholder = placeholder;
                isLoading = false;
                optionsList = Object.keys(options).map(itemid => {
                    return options[itemid];
                })
                break;
            default:
                break;
        }
        return (
            <div className="selector-set">
                <div className="super-label">{labelName}</div>
                <Select
                    styles={customStyles}
                    className={`selector ${name}-select`}
                    classNamePrefix={`${name}-select`}
                    isLoading={isLoading}
                    options={optionsList}
                    onChange={action}
                    placeholder={advPlaceholder}
                    isSearchable={searchable}
                    value={value}
                />  
            </div>
        )
    }
}

export default SuperSelect;