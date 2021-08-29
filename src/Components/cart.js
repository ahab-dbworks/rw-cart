import React from 'react';
import RadioButton from './radio';
import CartItem from './cartItem';
import _ from 'lodash';

const Cart = (props) => {
    const { cartList } = props;
    let cartBody = undefined;
    let cartSubTotal = 0;
    let topTier = {}
    Object.keys(cartList).forEach(key => {
        const item = cartList[key];
        if (item.branchChain.length === 5 || item.isOption) cartSubTotal += item.rate * item.quantity.actual;
        if (!topTier[item.branchChain[0]]) {
            topTier[item.branchChain[0]] = [];
        }
        topTier[item.branchChain[0]].push(item);
    })
    const grandTotal = cartSubTotal * props.quotePeriod;
    
    if (!_.isEmpty(cartList)) {
        cartBody = 
        <div className="dbw-table">
            <div className="dbw-thead">
                <ul className="dbw-header">
                    <li className="cart-col spacer"></li>
                    <li className="cart-col quantity numeric">Q</li>
                    <li className="cart-col name">Item</li>
                    <li className="cart-col rate numeric">Rate</li>
                </ul>
            </div>
            <div className="dbw-tbody">
                {
                    Object.keys(topTier).map(key => {
                        
                        return (
                            <CartItem
                                branchTier={1}
                                label={key}
                                content={topTier[key]}
                                isOnlyChild={Object.keys(topTier).length === 1}
                                updateCart={props.updateCart}
                                addNote={props.addNote}
                            />
                        )
                    })
                }
            </div>
        </div>
        
        
    } else {
        cartBody = <div className="modal barlow" style={{flex:1}}>Cart Empty</div>
    }
    const cartSwitchTotal = grandTotal > 0 ? grandTotal.toFixed(2) : "";
    const submitButton = (Object.keys(cartList).length > 0 ? <div className="text-button" onClick={props.submitQuote}><i>send</i><span>Submit Quote</span></div> : <div className="text-button disabled" ><i>send</i><span>Submit Quote</span></div>);
    
    return (
        <div>
            <div className="slide-panel-switch barlow" onClick={props.toggleCart}>
                {
                    props.cartMode === "in" ? <i>logout</i> : <div style={{display: "flex"}}><i>shopping_cart</i>{cartSwitchTotal}</div>
                }
            </div>
            <div className={`cart slide-panel ${props.cartMode}`}>
                <div className="column-header column-segment">
                    <h1><i>shopping_cart</i>CART</h1>
                </div>
                <div className="cart-contents column-segment">
                    {cartBody}
                </div>
                <div className="cart-summary column-segment barlow">
                    <div className="cart-summary-row">
                        <span>Daily Subtotal:</span>
                        $
                        {cartSubTotal.toFixed(2)}
                    </div>
                    <div className="cart-summary-row">
                        <span>Quote Duration</span>
                        {props.quotePeriod} {(props.quotePeriod > 1 ? "Days" : "Day")}
                    </div>
                    <div className="cart-summary-row grand">
                        <span>Total:</span>
                        $
                        {(cartSubTotal * props.quotePeriod).toFixed(2)}
                    </div>
                </div>
                <div className="panel-buttons">
                    <div className="text-button secondary dim" onClick={props.clearCart}><i>delete_forever</i><span>Clear Cart</span></div>
                    {submitButton}
                </div>
            </div>
        </div>
    )
}

export default Cart;