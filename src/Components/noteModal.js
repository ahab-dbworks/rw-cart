import React from 'react';

class NoteModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            note: props.item.note
        }
    }

    submit = () => {
        this.props.submit(this.props.item, this.state.note);
    }

    updateForm = (e) => {
        this.setState({ note: e.target.value});
    }

    render() {
        const { note } = this.state;
        const { item } = this.props;
        return (
            <div className="modal-layer">
                <div className="modal">
                    <div id="submitQuote" className="modal-container" style={{width: "500px"}}>
                        <div className="modal-header barlow">
                            Note for {item.name}
                        </div>
                        <div className="modal-body">
                            <div className={`input-set`}>
                                <div className="input-set-label">Note</div>
                                {
                                    <textarea id="note" type="textarea" onChange={(e) => this.updateForm(e)} value={note}/>
                                }
                            </div>
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

export default NoteModal;