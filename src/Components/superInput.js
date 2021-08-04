import React from 'react';
import _ from 'lodash';

class SuperInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: "read",
            stateValue: this.props.value
        }
    }

    changeMode = (newMode) => {
        switch (newMode) {
            case "read":
                this.props.updateValue(this.state.stateValue);
                this.setState({ mode: "read" });
                break;
            case "write":
                this.setState({ mode: "write", stateValue: this.props.value });
                break;
            default:
                break;
        }
    }

    changeValue = (e) => {
        this.setState({ stateValue: e.target.value })
    }

    enterValue = (e) => {
        if (e.key === "Enter") {
            this.changeMode("read");
        }
    }

    handleLoad = (e) => {
        e.target.select();
    }

    render() {
        const { mode, stateValue } = this.state;
        const { value } = this.props;
        let inputDisplay = undefined;
        switch (mode) {
            case "read":
                inputDisplay =
                    <div className="super-input">{value}</div>
                break;
            case "write":
                inputDisplay =
                    <input className="super-input" type="number" onFocus={this.handleLoad} onBlur={() => this.changeMode("read")} onChange={this.changeValue} onKeyPress={this.enterValue} value={stateValue} autoFocus/>
        }
        return (
            <div className="super-input-container" onClick={() => this.changeMode("write")}>
                {inputDisplay}
            </div>
        )
    }
}

export default SuperInput;