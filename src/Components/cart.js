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
                            />
                        )
                    })
                }
            </div>
        </div>
        
        
    } else {
        cartBody = <div className="modal" style={{flex:1}}>Cart Empty</div>
    }
    
    return (
        <div className="cart-container">
            <div className="cart-contents param-set">
                {cartBody}
            </div>
            <div className="cart-summary param-set barlow">
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
        </div>
    )
}

export default Cart;