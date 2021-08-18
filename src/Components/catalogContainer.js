import React from 'react';
import CatalogItem from './catalogItem';
import Loader from '../loader';
import _ from 'lodash';

class CatalogContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
        this.isExpanded = false
        this.subRowCount = 1;
        this.content = undefined;
        this.rowIndex = {};
    }

    loadAccessories = async () => {
        this.content = await this.props.loader(this.props.rowContent[2]);
        this.subRowCount = this.content.Rows.length;
    }

    toggleExpanded = async () => {
        const { address, updateSubRows } = this.props;
        this.isExpanded = !this.isExpanded;
        if (!this.content) {
            await this.loadAccessories();
        }
        if (this.props.rootParent) {
            this.rowIndex[address] = this.subRowCount;
            this.forceUpdate()
        } else {
            updateSubRows(address, (this.isExpanded ? this.subRowCount : 0));
        }
        
    }

    updateSubRows = (subAddress, subRowCount) => {
        this.rowIndex[subAddress] = subRowCount;
        this.forceUpdate();
    }

    render() {
        const { address, header, cart, loader, addItemToCart, backgroundContrast } = this.props;
        let rowIndex, updateSubRows = undefined;
        if (this.props.rootParent) {
            updateSubRows = this.updateSubRows;
            rowIndex = this.rowIndex;
        } else {
            updateSubRows = this.props.updateSubRows;
            rowIndex = this.props.rowIndex
        }
        //
        const tabBtn = this.isExpanded ? "expand_less" : "expand_more";
        const rowTab = <div className="row-expander btn" onClick={this.toggleExpanded}><i>{tabBtn}</i></div>
        //
        let accessoryContent = undefined;
        let showRows = 1;
        if (this.isExpanded) {
            Object.keys(rowIndex).forEach(rowSet => {
                if (rowSet.indexOf(address) === 0) {
                    showRows += rowIndex[rowSet];
                }
            })
            if (this.content) {
                accessoryContent = this.content.Rows.map((item, i) => {
                    return (
                        <div key={i} className={`catalog-item-container ${item[19]}`}>
                            <CatalogItem
                                address={address}
                                rowContent={item}
                                cart={cart}
                                loader={loader}
                                addItemToCart={addItemToCart}
                                updateSubRows={updateSubRows}
                                rootParent={false}
                                rowIndex={rowIndex}
                            />
                        </div>
                    )
                })
            } else {
                accessoryContent = <Loader/>
            }
        } else {
            showRows = 1;
        }

        

        //style={{ height: (subRowCount * 50) + "px" }} -- in parent div (below) for animated row expansion
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