import React from 'react';
import CartItem from './cartItem';
import SuperInput from './superInput';
import _ from 'lodash';
import { Expander, NestedNode } from './nestedexpander';
import './styling/cart.css';

const Cart = (props) => {
    const { cartList, delimiter } = props;
    const tierDepth = 3;
    const structuredCart = {};
    Object.keys(cartList).forEach(item => {
        const cartItem = cartList[item];
        const amount = cartItem.rate * cartItem.quantity.actual;
        const chainLength = cartItem.branchChain.length;
        let tempChain = structuredCart;
        cartItem.branchChain.forEach((link, i) => {
            if (link != "") {
                if (i < tierDepth) {
                    if (!tempChain[link]) {
                        tempChain[link] = {
                            label: link,
                            nodeChildren: {},
                            note: "",
                            subTotal: 0,
                            type: "TIER"
                        }
                    }
                    if (cartItem.isOption) {
                        if (cartItem.quantity.actual > Math.ceil(cartItem.quantity.default)) {
                            tempChain[link].subTotal += cartItem.rate * (cartItem.quantity.actual - Math.ceil(cartItem.quantity.default));
                        }
                    }
                    if (cartItem.parent === null) {
                        tempChain[link].subTotal += cartItem.rate * (cartItem.quantity.actual);
                    }
                    tempChain = tempChain[link].nodeChildren;
                } else {
                    if (!tempChain[link]) {
                        tempChain[link] = {
                            nodeChildren: {},
                            note: "",
                            optionalTotal: 0,
                            itemTotal: 0
                        }
                    }
                    if (i + 1 === chainLength) {
                        _.merge(tempChain[link], cartItem);
                        tempChain[link].itemTotal = cartItem.rate * cartItem.quantity.actual;
                    } else {
                        if (cartItem.isOption) {
                            if (cartItem.quantity.actual > Math.ceil(cartItem.quantity.default)) {
                                tempChain[link].optionalTotal += cartItem.rate * (cartItem.quantity.actual - Math.ceil(cartItem.quantity.default));
                            }
                        }
                        tempChain = tempChain[link].nodeChildren;
                    }
                }
            }
        })
    })
    console.log("structured Cart:", structuredCart);

    let cartSubTotal = 0;
    
    Object.keys(structuredCart).forEach(invType => {
        cartSubTotal += structuredCart[invType].subTotal;
    })
    
    const grandTotal = cartSubTotal * props.quotePeriod;

    const elementBuilder = (node, i) => {
        let hasNoChildren = undefined;
        switch (node.type) {
            case "ITEM":
            case "ACCESSORY":
                hasNoChildren = true;
                break;
            default:
                hasNoChildren = false;
        }

        
        let itemQuantity = undefined;
        if (node.type != "TIER") {
            itemQuantity = <div className="quantity-static">{node.quantity.actual}</div>;
            if (!node.parent || node.parent && node.isOption) {
                itemQuantity =
                    <SuperInput
                        value={node.quantity.actual}
                        updateValue={(q) => node.updateCartQuantity(q)}
                    />
            }
        }
        let itemSubTotal = node.type === "TIER" ? node.subTotal : node.itemTotal + node.optionalTotal;
    

        const itemHTML = <div className="cart-node">
            <ul className={`${node.isOption ? "option " : ""}`}>
                <li className={`cart-col bullet ${_.isEmpty(node.nodeChildren) ? "" : "hide"}`}>•</li>
                <li className="cart-col quantity">
                    {itemQuantity}
                </li>
                <li className="cart-col name" onClick={() => node.displayNote()}>
                    {(node.note != "" ? <i>sticky_note_2</i> : "")}
                    <div>{node.label}</div>
                </li>
                <li className="cart-col rate numeric">{delimiter(itemSubTotal)}</li>
            </ul>
        </div>

        return (
            <NestedNode
                nodeKey={i}
                nodeDetail={node}
                nodeLabel={itemHTML}
                buttonClosed={'navigate_next'}
                buttonOpen={'expand_more'}
                builder={elementBuilder}
                hasNoChildren={hasNoChildren}
                expansionTrigger={"button"}
                collapseTrigger={"button"}
                nodeChildren={node.nodeChildren}
                startOpen
                hideOnlyChildTiers
            />
        )
    }

    let cartBody = undefined;
    if (!_.isEmpty(structuredCart)) {
        cartBody = 
        <div className="dbw-table">
            <div className="dbw-thead">
                <ul className="dbw-header">
                    <li className="cart-col spacer"></li>
                    <li className="cart-col quantity">Q</li>
                    <li className="cart-col name">Item</li>
                    <li className="cart-col rate numeric">Subtotal</li>
                </ul>
            </div>
            <div className="dbw-tbody">
                <Expander
                    nodeSeries={structuredCart}
                    elementBuilder={elementBuilder}
                />
            </div>
        </div>
        
        
    } else {
        cartBody = <div className="modal barlow" style={{flex:1}}>Cart Empty</div>
    }
    const cartSwitchTotal = grandTotal > 0 ? grandTotal.toFixed(2) : "";
    const cartHasItems = Object.keys(cartList).length > 0;
    const submitButton = <div className={`text-button${cartHasItems ? "" : " disabled"}`} onClick={cartHasItems ? props.submitQuote : null}><i>send</i><span>Check Out</span></div>;
    
    return (
        <div>
            <div className="slide-panel-switch barlow" onClick={props.toggleCart}>
                {
                    props.cartMode === "in" ? <i>logout</i> : <div style={{display: "flex"}}><i>shopping_cart</i>{cartSwitchTotal}</div>
                }
            </div>
            <section className={`cart slide-panel ${props.cartMode}`}>
                <h1><i>shopping_cart</i>CART</h1>
                <div className="cart-contents column-segment">
                    {cartBody}
                </div>
                <div className="cart-summary column-segment padded barlow">
                    <div className="cart-summary-row">
                        <span>Daily Subtotal:</span>
                        $
                        {delimiter(cartSubTotal)}
                    </div>
                    <div className="cart-summary-row">
                        <span>Quote Duration</span>
                        {props.quotePeriod} {(props.quotePeriod > 1 ? "Days" : "Day")}
                    </div>
                    <div className="cart-summary-row grand">
                        <span>Total:</span>
                        $
                        {delimiter((cartSubTotal * props.quotePeriod))}
                    </div>
                </div>
                <div className="panel-buttons">
                    <div className="text-button secondary dim" onClick={props.clearCart}><i>delete_forever</i><span>Clear Cart</span></div>
                    {submitButton}
                </div>
            </section>
        </div>
    )
}

export default Cart;