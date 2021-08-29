import React from 'react';

const PictureModal = ({ src, title, cancel }) => {
    console.log("we got this far", src, title);
    return (
        <div className="modal-layer">
            <div className="modal">
                <div id="submitQuote" className="modal-container">
                    <div className="modal-header barlow">
                        {title}
                    </div>
                    <div className="modal-body">
                        <img src={src}/>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop abs" onClick={cancel}></div>
        </div>
    )
}

export default PictureModal;