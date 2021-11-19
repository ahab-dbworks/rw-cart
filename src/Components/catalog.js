import React from 'react';
import _ from 'lodash';
import CatalogItem from './catalogItem';
import RadioButton from './radio';
import SuperInput from './superInput';
import { Expander, NestedNode } from './nestedexpander';
import Loader from '../loader';
import './styling/catalog.css';
import './styling/pagecontrol.css';

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

class PageControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    loadPage = (page) => {
        this.props.loader(page)
    }

    render() {
        const { pageNo, pages } = this.props;
        const localPages = [];
        let p = Math.max(pageNo - 2, 1);
        let pStop = p + 4;
        if (pStop > pages) {
            pStop = pages;
            p = pages - 4;
        }
        for (; p <= pStop; p++){
            localPages.push(p);
        }
        const prevDisabled = pageNo === 1;
        const nextDisabled = pageNo === pages;
        return (
            <div className="page-control">
                <ul className="">
                    <li className={`page-button${prevDisabled ? " disabled" : ""}`} onClick={prevDisabled ? null : () => this.loadPage(1)}><i>first_page</i></li>
                    <li className={`page-button${prevDisabled ? " disabled" : ""}`} onClick={prevDisabled ? null : () => this.loadPage(pageNo - 1)}><i>chevron_left</i></li>
                    {
                        localPages.map(page => {
                            return <li className={`page-button${pageNo === page ? " current-page" : ""}`} onClick={() => this.loadPage(page)}>{page}</li>
                        })
                    }
                    <li className={`page-button${nextDisabled ? " disabled" : ""}`} onClick={nextDisabled ? null : () => this.loadPage(pageNo + 1)}><i>chevron_right</i></li>
                    <li className={`page-button${nextDisabled ? " disabled" : ""}`} onClick={nextDisabled ? null : () => this.loadPage(pages)}><i>last_page</i></li>
                </ul>
            </div>
        )
    }
}

class BrowseImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            itemImage: <Loader/>
        }
    }

    load = async () => {
        const loadedImage = await this.props.loader();
        let imgElement = <img src={loadedImage} />
        if (loadedImage === null) {
            imgElement = <div className="no-image"><i>cancel_presentation</i><span>No Image</span></div>
        }
        this.setState({ itemImage: imgElement });
    }

    componentDidMount() {
        this.load();
    }

    render() {
        return <div className="image-container" onClick={this.props.preview}>{this.state.itemImage}</div>
    }
}

class Catalog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayMode: DISPLAYMODEOPTIONS[1],
            catalogInventory: undefined,
            searchField: "",
            mode: "waiting"
        }
    }
    
    clearSearchField = () => {
        this.setState({ searchField: "" });
    }

    loadInventory = async (page) => {
        this.setState({mode: "loading"});
        const catalogInventory = await this.props.loader(this.state.searchField, page);
        console.log("loaded:", catalogInventory);
        this.setState({ catalogInventory: catalogInventory, mode: "display" });
    }

    search = (e) => {
        this.setState({ searchField: e.target.value });
    }

    browseSearch = (e) => {

        if (e.key === "Enter" && this.props.fetchInventoryMethod === "browse") {
            this.loadInventory(this.state.catalogInventory.pageNo);
        }
    }

    setDisplayMode = (e) => {
        this.setState({ displayMode: e })
    }

    elementBuilder = (node, i) => {
        const { cart, delimiter } = this.props;
        //
        let hasNoChildren, hideExpander = undefined;
        switch (node.type) {
            case "ITEM":
            case "ACCESSORY":
                hasNoChildren = true;
                break;
            default:
                hideExpander = "hide";
                hasNoChildren = false;
        }
        //handle item quantity
        let cartQ = 0;
        let qPlus = false;
        let qMinus = false;
        if (node.available > 0) {
            if (cart[node.address]) {
                cartQ = cart[node.address].quantity.actual;
                qMinus = cartQ > 0 ? true : false;
                if (node.available > cartQ) {
                    qPlus = true;
                }
            } else {
                qPlus = true;
            }
        }
        //handle image preview
        let imageSource = undefined;
        switch (this.props.fetchInventoryMethod) {
            case "search":
                if (node.imgSrc) {
                    imageSource = <div className="item-image-thumbnail" onClick={() => node.picPreview()}><img src={node.imgSrc}/></div>
                } else {
                    imageSource = <div className="item-image-thumbnail"><i>cancel_presentation</i><br/><span>No Image</span></div>
                }
                break;
            case "browse":
                imageSource = <BrowseImage loader={node.loadBrowseImage} preview={node.picPreview}/>;
                break;
            default:
        }
        //
        const itemRow = <div className={`catalog-item ${node.type}`}>
            <div className={`row-expander ${hideExpander}`}></div>
            <ul className="catalog-item-elements">
                <li className="item-segment item-quantity">
                    <div className="quantity-control">
                        <div className={`btn${qMinus ? "" : " inactive"}`} onClick={(qMinus ? () => node.updateCartQuantity(cartQ - 1) : null)}>
                            <i>remove</i>
                        </div>
                        <div className="quantity-count">
                            <SuperInput
                                value={cartQ}
                                updateValue={(q) => node.updateCartQuantity(q)}
                            />
                        </div>
                        <div className={`btn${qPlus ? "" : " inactive"}`} onClick={(qPlus ? () => node.updateCartQuantity(cartQ + 1) : null)}>
                            <i>add</i>
                        </div>
                    </div>
                </li>
                <li className="item-segment item-rate numeric">
                    <div className="grid-label">Rate:</div>
                    <div className="numeric">$ {delimiter(node.rate)}</div>
                </li>
                <li className="item-segment item-image">{imageSource}</li>
                <li className="item-segment item-description">
                    <div className="row-description">{node.label}</div>
                </li>
            </ul>
        </div>
        //
        return (
            <NestedNode
                nodeKey={i}
                nodeDetail={node}
                nodeLabel={itemRow}
                buttonClosed={'navigate_next'}
                buttonOpen={'expand_more'}
                builder={this.elementBuilder}
                hasNoChildren={hasNoChildren}
                expansionTrigger={"button"}
                collapseTrigger={"button"}
            />
        )
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.inventoryType != null) {
            if (!_.isEqual(this.props, prevProps) || this.state.searchField === "" && prevState.searchField != "") {
                this.loadInventory(1);
                // if (this.props.inventoryType.id != prevProps.inventoryType.id) {
                // }
            }
            
        }
    }
    componentDidMount() {
        // console.log(this.props);
        // const { inventoryType } = this.props;
        // if (inventoryType) {
        //     this.loadInventory();
        // }
    }

    render() {
        const { displayMode, catalogInventory, searchField, mode } = this.state;
        const { cart, addressChain, getAccessories, activity, picPreview, fetchInventoryMethod } = this.props;
        let searchBar, catalogDisplay, catalogContent, catalogPageControl = undefined;
        
        switch (mode) {
            case "waiting":
                catalogDisplay = <div className="modal-anchor"><div className="modal-content barlow">Select an Inventory Type to Begin...</div></div>
                break;
            case "loading":
                catalogDisplay = <div className="modal-anchor"><div className="modal-content barlow"><Loader/></div></div>
                break;
            case "display":
                const filteredInventory = catalogInventory.inventory;
                if (fetchInventoryMethod === "search") {
                    filteredInventory = catalogInventory.inventory.filter(item => {
                        return item.label.toLowerCase().includes(searchField.toLowerCase())
                    })
                }
                let loadMessage = "";
                if (filteredInventory.length > 0) {
                    loadMessage = null;
                } else {
                    loadMessage = <div className="modal-anchor"><div className="modal-content barlow">No inventory items match this criteria</div></div>
                }
                
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
                                    <Expander
                                        nodeSeries={filteredInventory}
                                        elementBuilder={this.elementBuilder}
                                    />
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
                if (catalogInventory.totalPages > 25) {
                    catalogPageControl =<PageControl
                        pageNo={catalogInventory.pageNo}
                        pages={catalogInventory.totalPages}
                        loader={this.loadInventory}
                    />
                }
                break;

            default:
                break;
        }

        return (
            <section className="catalog">
                <h1><i>menu_book</i>{activity.label.toUpperCase()} CATALOG{addressChain}</h1>
                <div className={`catalog-control${_.isEmpty(catalogInventory) ? " disabled" : ""}`}>
                    <div className="search-field">
                        <input type="text" onChange={this.search} onKeyPress={this.browseSearch} value={searchField} placeholder="Search..." disabled={_.isEmpty(catalogInventory)}/>
                    <div className={`clear-search${searchField != "" ? "" : " hide"}`} onClick={this.clearSearchField}><i>close</i></div>
                    </div>
                    <RadioButton
                        name="Display Mode"
                        options={DISPLAYMODEOPTIONS}
                        selected={displayMode.name}
                        action={this.setDisplayMode}
                    />
                </div>
                {catalogDisplay}
                {catalogPageControl}
            </section>
        )
    }
}

export default Catalog;