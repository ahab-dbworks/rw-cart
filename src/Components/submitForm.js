import React from 'react';

class SubmitForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            project: {label: "Project", value: "", blank: false, type: "text"},
            contact: {label: "Contact", value: "", blank: false, type: "text"},
            email: {label: "Email", value: "", blank: false, type: "email"},
            phone: {label: "Phone", value: "", blank: false, type: "text"},
            note: {label: "Note", value: "", blank: false, type: "textarea"}
        }
    }

    submit = () => {
        let newState = {}
        let formFault = false;
        Object.keys(this.state).forEach(formField => {
            newState[formField] = this.state[formField];
            if (newState[formField].value === "" && newState[formField].label != "Note") {
                newState[formField].blank = true;
                formFault = true;
            }
        })
        if (formFault) {
            this.setState(newState)
        }else{
            this.props.submit(this.state);
        }
    }

    updateForm = (e) => {
        console.log(e);
        this.setState(prevState => ({ [e.target.id]: {...prevState[e.target.id], value: e.target.value} }));
    }

    render() {
        return (
            <div className="modal-layer">
                <div className="modal">
                    <div id="submitQuote" className="modal-container" style={{width: "500px"}}>
                        <div className="modal-header barlow">
                            Request Quote
                        </div>
                        <div className="modal-body">
                            {
                                Object.keys(this.state).map(key => {
                                    const field = this.state[key];
                                    return (
                                        <div className={`input-set ${field.type}`}>
                                            <div className="input-set-label">{field.label}</div>
                                            {
                                                (field.type === "textarea" ? <textarea id={key} type={field.type} className={(field.blank ? "fault" : "")} onChange={(e) => this.updateForm(e)} value={field.value}/> : <input id={key} type={field.type} className={(field.blank ? "fault" : "")} onChange={(e) => this.updateForm(e)} value={field.value}/>)
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div className="panel-buttons">
                            <div className="text-button secondary dim" onClick={this.props.cancel}><i>do_disturb</i><span>Cancel</span></div>
                            <div className="text-button" onClick={this.submit}><i>send</i><span>Submit</span></div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop abs" onClick={this.props.cancel}></div>
            </div>
        )
    }
}

export default SubmitForm;