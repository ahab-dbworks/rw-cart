import React from 'react';
import CatalogItem from './catalogItem';
import Loader from '../loader';
import _ from 'lodash';

class CatalogContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            
        }
        this.childItems = null;
        this.contentIsLoaded = false;
        this.subRowCount = 1;
        this.isExpanded = false
        this.rowIndex = {};
    }

    loadAccessories = async () => {
        this.childItems = await this.props.item.loadAccessories();
        this.contentIsLoaded = true;
        this.subRowCount = this.childItems.length;
        this.completeToggle();
    }

    toggleExpanded = async () => {
        this.isExpanded = !this.isExpanded;
        if (!this.contentIsLoaded) {
            this.loadAccessories();
        }
        this.completeToggle();
    }
    
    completeToggle = () => {
        const { item, updateSubRows } = this.props;
        if (this.props.rootParent) {
            this.rowIndex[item.address] = this.subRowCount;
            this.forceUpdate();
        } else {
            console.log("parent address:", item.parent.address, "isExpanded:", this.isExpanded, "subRowCount:", this.subRowCount);
            updateSubRows(item.address, (this.isExpanded ? this.subRowCount : 0));
        }
    }

    updateSubRows = (subAddress, childRowCount) => {
        this.rowIndex[subAddress] = childRowCount;
        this.forceUpdate();
    }

    render() {
        const { item, header, cart, loader, picPreview, displayMode } = this.props;
        let rowIndex, updateSubRows = undefined;
        if (this.props.rootParent) {
            updateSubRows = this.updateSubRows;
            rowIndex = this.rowIndex;
        } else {
            updateSubRows = this.props.updateSubRows;
            rowIndex = this.props.rowIndex
        }
        //
        const rowTab = (displayMode === "table" ? <div className={`row-expander btn ${(this.isExpanded ? "expanded" : "collapsed")}`} onClick={this.toggleExpanded}><i>{(this.isExpanded ? "expand_less" : "expand_more")}</i></div> : <div className="row-expander"></div>)
        //
        let accessoryContent = undefined;
        let showRows = 1;
        if (this.isExpanded) {
            Object.keys(rowIndex).forEach(rowSet => {
                if (rowSet.indexOf(item.address) === 0) {
                    showRows += rowIndex[rowSet];
                }
            })
            accessoryContent = <Loader />;
            if (this.contentIsLoaded) {
                accessoryContent = this.childItems.map((item, i) => {
                    return (
                        <div key={i} className={`catalog-item-container ${item.type} ${(this.isExpanded ? "expanded" : "collapsed")}`}>
                            <CatalogItem
                                item={item}
                                cart={cart}
                                updateSubRows={updateSubRows}
                                rootParent={false}
                                rowIndex={rowIndex}
                                displayMode={displayMode}
                            />
                        </div>
                    )
                })
            }
        } else {
            Object.keys(rowIndex).forEach(rowSet => {
                if (rowSet.indexOf(item.address) === 0) {
                    rowIndex[rowSet] = 0;
                }
            })
            showRows = 1;
        }
        //style={{ height: (this.subRowCount * 50) + "px" }} -- in parent div (below) for animated row expansion
        return (
            <div className="collapsible-container" style={{ height: ((showRows * 52) + (this.isExpanded ? showRows * 2 : 0)) + "px" }}>  
                <div className="container-header">
                    {rowTab}
                    {header}
                </div>
                <div className="container-accessories">
                    {accessoryContent}
                </div>
            </div>
        )
    }
}

export default CatalogContainer;