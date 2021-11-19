import React from 'react';
import Loader from '../loader';
import _ from 'lodash';
import './styling/nestedexpander.css';

class Expander extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { nodeSeries, elementBuilder } = this.props;
        let seriesContent = undefined;
        switch (nodeSeries) {
            case undefined:
                seriesContent = <div style={{"display": "flex", "width": "100%", "justifContent": "center"}}><Loader/></div>
                break;
            default:
                seriesContent = <div className="nested-nodeSeries-list">
                    {
                        Object.keys(nodeSeries).map((node, i) => {
                            return elementBuilder(_.cloneDeep(nodeSeries[node]), i);
                        })
                    }
                </div>
        }
        return seriesContent;
    }
}

class NestedNode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
            nodeChildren: this.props.nodeChildren ? this.props.nodeChildren : {},
            loading: false
        }
        this.expansionScheme = [
            "button", //only the button activates the expansion
            "node", //entire node activates expansion
            "hover" //expansion based on hover

        ]
    }

    loadChildren = async () => {
        const { nodeDetail } = this.props;
        this.setState({ loading: true });
        const nodeChildren = await nodeDetail.loadChildren();
        this.setState({ nodeChildren: nodeChildren, loading: false });
    }

    expand = (show) => {
        if (show) {
            let tempExpanded = true;
            if (_.isEmpty(this.state.nodeChildren) && !this.props.preload) {
                this.loadChildren();
            }
            this.setState({ expanded: tempExpanded });
        } else {
            this.setState({ expanded: false });
        }
    }

    nodeClick = () => {
        const { expansionTrigger, collapseTrigger, nodeDetail, nodeClick } = this.props;
        const { expanded } = this.state;
        if (expanded) {
            if (collapseTrigger === "node") {
                this.expand(false);
            } 
        } else {
            if (expansionTrigger === "node") {
                this.expand(true);
            } 
        }
        if (typeof nodeClick === 'function') {
            nodeClick();
        }
    }

    detailClick = () => {
        const { expansionTrigger, collapseTrigger, nodeDetail, detailClick } = this.props;
        const { expanded } = this.state;
        if (expanded) {
            if (collapseTrigger === "detail") {
                this.expand(false);
            } 
        } else {
            if (expansionTrigger === "detail") {
                this.expand(true);
            } 
        }
        if (typeof detailClick === 'function') {
            detailClick();
        }
    }

    buttonClick = () => {
        const { expansionTrigger, collapseTrigger, nodeDetail, buttonClick } = this.props;
        const { expanded } = this.state;
        if (expanded) {
            if (collapseTrigger === "button") {
                this.expand(false);
            } 
        } else {
            if (expansionTrigger === "button") {
                this.expand(true);
            } 
        }
        if (typeof buttonClick === 'function') {
            buttonClick();
        }
    }

    mouseAction = (direction) => {
        const { expansionTrigger, collapseTrigger, nodeDetail, hover } = this.props;
        const { expanded } = this.state;
        if (expanded) {
            if (collapseTrigger === "mouse" && direction === "leave") {
                this.expand(false);
            } 
        } else {
            if (expansionTrigger === "mouse" && direction === "enter") {
                this.expand(true);
            } 
        }
    }

    componentDidMount() {
        const { preload, startOpen } = this.props;
        if (preload) {
            this.loadChildren();
        }
        if (startOpen) {
            this.setState({ expanded: true });
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (!_.isEmpty(props.nodeChildren)) {
            return { nodeChildren: props.nodeChildren };
        }
        return null;
    }

    render() {
        const { nodeKey, nodeDetail, nodeLabel, buttonClick, detailClick, buttonClosed, buttonOpen, preload, hasNoChildren, hideOnlyChildTiers } = this.props;
        const { expanded, nodeChildren, loading } = this.state;
        const buttonIcon = expanded ? buttonOpen : buttonClosed;
        let hideButton = undefined;
        if (preload) {
            hideButton = _.isEmpty(nodeChildren);
        }else{
            hideButton = hasNoChildren;
        }
        //
        let nodeChildrenBlock = undefined;
        if (loading) {
            nodeChildrenBlock = <Loader/>
        }
        if(!_.isEmpty(nodeChildren)){
            nodeChildrenBlock = <Expander
                nodeSeries={nodeChildren}
                elementBuilder={this.props.builder}
            />
        }
        return (
            <div key={nodeKey} className="node-element" onMouseEnter={() => this.mouseAction("enter")} onMouseLeave={() => this.mouseAction("leave")} onClickCapture={() => this.nodeClick()}>
                <div className={`node-detail ${nodeDetail.type} ${hideOnlyChildTiers ? "flag" : ""}`}>
                    <div className="node-label" onClickCapture={this.detailClick}>{nodeLabel}</div>
                    <div className={`node-button ${hideButton ? "hide" : ""}`} onClickCapture={this.buttonClick}><i>{buttonIcon}</i></div>
                </div>
                <div className={`node-children ${expanded ? "show" : ""}`}>
                    {nodeChildrenBlock}
                </div>
            </div>
        )
    }
}

export {
    Expander,
    NestedNode
}