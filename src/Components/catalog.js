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
            catalogInventory: undefined,
            searchField: ""
        }
        this.mode = "waiting";
    }

    loadInventory = async () => {
        this.mode = "loading";
        const catalogInventory = await this.props.loader();
        // console.log("loaded:", catalogInventory);
        if (catalogInventory) {
            this.mode = "display"
            this.setState({ catalogInventory: catalogInventory });
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
        const { displayMode, catalogInventory, searchField } = this.state;
        const { cart, getAccessories, addItemToCart, activity, warehouse, inventoryType, category, subCategory, picPreview } = this.props;
        let searchBar, catalogDisplay, catalogContent = undefined;

        let address = undefined;
        if (category === null || inventoryType === null || warehouse === null || activity === null) {
            this.mode = "waiting";
        }
        
        switch (this.mode) {
            case "waiting":
                catalogDisplay = <div className="modal-anchor"><div className="modal-content barlow">AWAITING PARAMETERS</div></div>
                break;
            case "loading":
                catalogDisplay = <div className="modal-anchor"><div className="modal-content barlow"><Loader/></div></div>
                break;
            case "display":
                address = `${activity.name}~${warehouse.name}~${inventoryType.name}~${category.name}` + (subCategory ? `~${subCategory.name}` : "");
                const filteredInventory = catalogInventory.filter(item => {
                    return item.description.toLowerCase().includes(searchField.toLowerCase())
                })
                let loadMessage = "";
                if (filteredInventory.length > 0) {
                    loadMessage = null;
                } else {
                    loadMessage = <div className="modal-anchor"><div className="modal-content barlow">No inventory items match this criteria</div></div>
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
                catalogContent = filteredInventory.map((item, i) => {
                    return (
                        <div key={i} className={`catalog-item-container ${item.type}`}>
                            <CatalogItem
                                item={item}
                                cart={cart}
                                loader={getAccessories}
                                rootParent={true}
                                picPreview={picPreview}
                                displayMode={displayMode.name}
                            />
                        </div>
                    )
                })
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
                                {catalogContent}
                                {loadMessage}
                            </div>
                        </div>
                        break;
                    case "grid":
                        catalogDisplay =
                            <div className="dbw-grid">
                                {catalogContent}
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