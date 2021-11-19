import React from 'react';
import ExpansionMenu from './expansionmenu';
import _ from 'lodash';
import './styling/expansionmenu.css';

class MenuOption extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displaySubMenu: false,
            content: undefined
        }
    }

    expand = (show) => {
        this.setState({displaySubMenu: show})
    }

    setSelection = () => {
        const { tier, object, menuStructure } = this.props;
        this.expand(true);
        menuStructure[tier - 1].setter(object);
    }

    loadContent = async () => {
        const { menuStructure, idValues, tier } = this.props;
        const content = await menuStructure[tier].loader(idValues);
        this.setState({ content: content });
    }

    componentDidMount() {
        const { menuStructure, tier } = this.props;
        if (tier < menuStructure.length) {
            this.loadContent();
        }
    }

    render() {
        const { tier, idValues, menuStructure, object } = this.props;
        const { displaySubMenu, content } = this.state;
        const contentCount = _.keys(content).length;
        let expansionSegment = null;
        if (!_.isEmpty(content)) {
            expansionSegment = <div className={`sub-options`} style={{ backgroundColor: `hsl(var(--primary-hue), calc(var(--primary-sat) - ${tier * 10}%), calc(var(--primary-lum) - ${tier * 10}%)`, height: `${displaySubMenu ? contentCount * 39 : 0}px` }}>
                <ExpansionMenu
                    content={content}
                    menuStructure={menuStructure}
                    idValues={idValues}
                    tier={tier + 1}
                />
            </div>
        }
        const subIcon = !_.isEmpty(content) ? <i>navigate_next</i> : null;
        return (
            <div className="menu-option" onMouseLeave={() => this.expand(false)} onClickCapture={this.setSelection}>
                <div className="option-label">{object.label}{subIcon}</div>
                {expansionSegment}
            </div>
        )
    }
}

export default MenuOption;