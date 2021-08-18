import React from 'react';
import _ from 'lodash';
import CatalogItem from './catalogItem';
import RadioButton from './radio';
import Loader from '../loader';

const DISPLAYMODEOPTIONS = [
    {
        name: "grid",
        value: "G",
        label: "Grid",
        icon: "calendar_view_month"
    },
    {
        name: "table",
        value: "T",
        label: "Table",
        icon: "reorder"
    }
]

class Catalog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayMode: DISPLAYMODEOPTIONS[1],
            content: undefined,
            searchField: ""
        }
        this.mode = "waiting";
    }

    loadInventory = async () => {
        this.mode = "loading";
        const content = await this.props.loader();
        // console.log("loaded:", content);
        if (content) {
            this.mode = "display"
            this.setState({ content: content });
        }
    }

    search = (e) => {
        this.setState({ searchField: e.target.value });
    }

    setDisplayMode = (e) => {
        this.setState({ displayMode: e })
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(this.props, prevProps)) {
            console.log("a catalog prop has changed")
            
            this.loadInventory();
        }    
    }
    componentDidMount() {
        console.log(this.props);
        const { warehouse, inventoryType, category } = this.props;
        if (warehouse && inventoryType && category) {
            this.loadInventory();
        }
    }

    render() {
        const { displayMode, content, searchField } = this.state;
        const { cart, getAccessories, addItemToCart, activity, warehouse, inventoryType, category, backgroundContrast } = this.props;
        let searchBar = undefined;
        let catalogDisplay = undefined;

        let address = undefined;
        if (category === null || inventoryType === null || warehouse === null || activity === null) {
            this.mode = "waiting";
        }
        
        switch (this.mode) {
            case "waiting":
                catalogDisplay = <div className="modal abs barlow">AWAITING PARAMETERS</div>
                break;
            case "loading":
                catalogDisplay = <div className="modal abs"><Loader/></div>
                break;
            case "display":
                address = `${activity.name}~${warehouse.name}~${inventoryType.name}~${category.name}`;
                const filteredContent = content.Rows.filter(row => {
                    return row[7].toLowerCase().includes(searchField.toLowerCase())
                })
                let loadMessage = "";
                if (filteredContent.length > 0) {
                    loadMessage = null;
                } else {
                    loadMessage = <div className="modal abs">No inventory items match this criteria</div>
                }
                searchBar =
                <div className="search-field">
                    <input type="text" onChange={this.search} value={searchField} placeholder="Search..." />
                    <RadioButton
                        name="Display Mode"
                        options={DISPLAYMODEOPTIONS}
                        selected={displayMode.name}
                        action={this.setDisplayMode}
                    />
                </div>
                switch (displayMode.name) {
                    case "table":
                        catalogDisplay = 
                        <div className="dbw-table">
                            <div className="dbw-thead">
                                <ul className="row-header">
                                    <li className="row-expander"></li>
                                    <li className="item-segment item-quantity">Quantity</li>
                                    <li className="item-segment item-image">Image</li>
                                    <li className="item-segment item-description">Item</li>
                                    <li className="item-segment item-rate">Rate</li>
                                    {/* <li className="item-segment">Available</li> */}
                                </ul>
                            </div>
                            <div className="dbw-tbody">
                                {
                                    filteredContent.map((item, i) => {
                                        return (
                                            <div key={i} className={`catalog-item-container ${item[19]}`}>
                                                <CatalogItem
                                                    address={address}
                                                    rowContent={item}
                                                    cart={cart}
                                                    loader={getAccessories}
                                                    addItemToCart={addItemToCart}
                                                    rootParent={true}
                                                />
                                            </div>
                                        )
                                    })
                                }
                                {loadMessage}
                            </div>
                        </div>
                        break;
                    case "grid":
                        catalogDisplay =
                            <div className="dbw-grid">
                                {
                                    filteredContent.map((item, i) => {
                                        return (
                                            <div key={i} className={`catalog-item-container ${item[19]}`}>
                                                <CatalogItem
                                                    address={address}
                                                    rowContent={item}
                                                    cart={cart}
                                                    loader={getAccessories}
                                                    addItemToCart={addItemToCart}
                                                    rootParent={true}
                                                />
                                            </div>
                                        )
                                    })
                                }
                                {loadMessage}
                            </div>
                        break;
                    default:
                        break;
                }
                break;

            default:
                break;
        }

        return (
            <section className="catalog">
                {searchBar}
                {catalogDisplay}
            </section>
        )
    }
}

export default Catalog;