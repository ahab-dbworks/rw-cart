import React from 'react';
import MenuOption from './menuoption';
import Loader from '../loader';
import './styling/expansionmenu.css';

const ExpansionMenu = ({ content, menuStructure, idValues, tier }) => {
    let menuOutput = undefined;
    switch (content) {
        case undefined:
            menuOutput = <Loader />
            break;
        default:
            menuOutput = <div className="menu-options-list">
                {
                    Object.keys(content).map((item, i) => {
                        const appendedIdValues = [...idValues];
                        appendedIdValues.push(content[item].id)
                        return <MenuOption
                            key={i}
                            tier={tier}
                            object={content[item]}
                            idValues={appendedIdValues}
                            menuStructure={menuStructure}
                            />
                    })
                }
            </div>
    }
    return menuOutput;
}

export default ExpansionMenu;