import React from 'react';

const PictureModal = ({ src, title, cancel }) => {
    console.log("we got this far", src, title);
    return (
        <div className="modal-layer">
            <div className="modal">
                <div id="picture-preview" className="modal-container pic-preview">
                    <div className="modal-header barlow">
                        {title}
                    </div>
                    <div className="modal-body">
                        <div className="pic">
                            <img src={src}/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop abs" onClick={cancel}></div>
        </div>
    )
}

export default PictureModal;