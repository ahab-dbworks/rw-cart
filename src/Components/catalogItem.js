import React from 'react';
import CatalogContainer from './catalogContainer';
import SuperInput from './superInput';

const CatalogItem = ({ item, cart, loader, addItemToCart, updateSubRows, rowIndex, rootParent, picPreview, displayMode }) => {

    const generateDisplayContent = () => {
        //enable/disable PLUS and MINUS buttons
        let cartQ = 0;
        let qPlus = false;
        let qMinus = false;
        if (item.available > 0) {
            if (cart[item.address]) {
                cartQ = cart[item.address].quantity.actual;
                qMinus = cartQ > 0 ? true : false;
                if (item.available > cartQ) {
                    qPlus = true;
                }
            } else {
                qPlus = true;
            }
        }
        //handleimage preview
        let imageSource = undefined;
        if (item.imgSrc) {
            imageSource = <div className="item-image-thumbnail" onClick={() => picPreview(item.imgSrc, item.description)}><img src={item.imgSrc}/></div>
        } else {
            imageSource = <div className="item-image-thumbnail"><i>cancel_presentation</i><br/><span>No Image</span></div>
        }

        let optional = "";
        if (item.parent) {
            optional = item.isOption ? "optional" : "required"
        }

        return (
            <ul className="catalog-item-elements">
                <li className={`item-segment item-quantity ${optional}`}>
                    <div className="quantity-control">
                        <div className={`btn${qMinus ? "" : " inactive"}`} onClick={(qMinus ? () => addItemToCart(item, cartQ - 1) : null)}>
                            <i>remove</i>
                        </div>
                        <div className="quantity-count">
                            <SuperInput
                                value={cartQ}
                                updateValue={(q) => addItemToCart(item, q)}
                            />
                        </div>
                        <div className={`btn${qPlus ? "" : " inactive"}`} onClick={(qPlus ? () => addItemToCart(item, cartQ + 1) : null)}>
                            <i>add</i>
                        </div>
                    </div>
                </li>
                <li className="item-segment item-image">{imageSource}</li>
                <li className="item-segment item-description"><div className="row-description">{item.description}</div></li>
                <li className="item-segment item-rate numeric"><div className="grid-label">Rate:</div><div>$ {item.rate.toFixed(2)}</div></li>
                {/* <li className="item-segment numeric"><div className="grid-label">Available:</div><div>{item.available}</div></li> */}
            </ul>
        )
    }

    const itemContentForDisplay = generateDisplayContent();
    let rowTab = null;
    let rowOutput = undefined;
    switch (item.type) {
        case "ITEM":
        case "ACCESSORY":
            rowTab = <div className="row-expander"></div>
            rowOutput = itemContentForDisplay
            break;
        default:
            rowOutput =
                <CatalogContainer
                header={itemContentForDisplay}
                item={item}
                cart={cart}
                loader={loader}
                addItemToCart={addItemToCart}
                updateSubRows={updateSubRows}
                rowIndex={rowIndex}
                rootParent={rootParent}
                picPreview={picPreview}
                displayMode={displayMode}
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