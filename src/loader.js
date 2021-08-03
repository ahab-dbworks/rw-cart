import React from 'react';

const Loader = (props) => {
    const message = props.input ? props.input : "LOADING";
    console.log("loader details:", props, message);
    return (
        <div className="loader-blip">
            <div className="loader-text">{message}</div>
            <ul className="blips">
                <li className="blip"></li>
                <li className="blip"></li>
                <li className="blip"></li>
                <li className="blip"></li>
                <li className="blip"></li>
                <li className="blip"></li>
                <li className="blip"></li>
            </ul>
        </div>
    )
}

export default Loader;