import React from 'react';
import CatalogContainer from './catalogContainer';
import SuperInput from './superInput';

const CatalogItem = (props) => {
    const address = props.address + "~" + props.rowContent[7] + (props.rowContent[3] != null ? "x" + props.rowContent[0] : "");

    const itemRow = (item) => {
        const { cart } = props;
        const rowDetails = {
            address: address,
            iCode: item[5],
            id: item[0],
            type: item[19].toLowerCase(),
            description: item[7],
            imgsrc: item[46],
            rate: item[35],
            avail: item[22],
            optional: item[51],
            parent: item[3]
        }

        let cartQ = 0;
        let qPlus = false;
        let qMinus = false;
        if (rowDetails.avail > 0) {
            if (cart[rowDetails.address]) {
                cartQ = cart[rowDetails.address].quantity.actual;
                qMinus = cartQ > 0 ? true : false;
                if (rowDetails.avail > cartQ) {
                    qPlus = true;
                }
            } else {
                qPlus = true;
            }
        }
        
        let imageSource = undefined;
        if (rowDetails.imgsrc) {
            imageSource = <div className="item-image-thumbnail"><img src={rowDetails.imgsrc}/></div>
        } else {
            imageSource = <div className="item-image-thumbnail"><i>cancel_presentation</i><br/><span>No Image</span></div>
        }

        let optional = "";
        if (rowDetails.parent) {
            optional = rowDetails.optional ? "optional" : "required"
        }

        return (
            <ul className="catalog-item-elements">
                <li className={`item-segment item-quantity ${optional}`}>
                    <div className="quantity-control">
                        <div className={`btn${qMinus ? "" : " inactive"}`} onClick={(qMinus ? () => props.addItemToCart(item, rowDetails.address, cartQ - 1) : null)}>
                            <i>remove</i>
                        </div>
                        <div className="quantity-count">
                            <SuperInput
                                value={cartQ}
                                updateValue={(q) => props.addItemToCart(item, rowDetails.address, q)}
                            />
                        </div>
                        <div className={`btn${qPlus ? "" : " inactive"}`} onClick={(qPlus ? () => props.addItemToCart(item, rowDetails.address, cartQ + 1) : null)}>
                            <i>add</i>
                        </div>
                    </div>
                </li>
                <li className="item-segment item-image">{imageSource}</li>
                <li className="item-segment item-description"><div className="row-description">{rowDetails.description}</div></li>
                <li className="item-segment item-rate numeric"><div className="grid-label">Rate:</div><div>$ {rowDetails.rate.toFixed(2)}</div></li>
                {/* <li className="item-segment numeric"><div className="grid-label">Available:</div><div>{rowDetails.avail}</div></li> */}
            </ul>
        )
    }

    const { rowContent, cart, loader, addItemToCart, updateSubRows, rowIndex, rootParent } = props;
    const rowHTML = itemRow(rowContent);
    let rowTab = null;
    let rowOutput = undefined;
    switch (rowContent[19]) {
        case "ITEM":
        case "ACCESSORY":
            rowTab = <div className="row-expander"></div>
            rowOutput = rowHTML
            break;
        default:
            rowOutput =
                <CatalogContainer
                    address={address}
                    header={rowHTML}
                    rowContent={rowContent}
                    cart={cart}
                    loader={loader}
                    addItemToCart={addItemToCart}
                    updateSubRows={updateSubRows}
                    rowIndex={rowIndex}
                    rootParent={rootParent}
                />
            break;
    }
    return (
        <div className="catalog-item">
            { rowTab }
            { rowOutput }
        </div>
    )
}

export default CatalogItem;