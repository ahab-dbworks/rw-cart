import React from 'react';
import CartContainer from './cartContainer';
import SuperInput from './superInput';

const CartItem = (props) => {
    const { branchTier, label, content, isOnlyChild } = props;

    let parentItemHeader = undefined;
    if (content.length > 1 || branchTier < 5) {
        let group = [];
        content.forEach(item => {
            if (item.branchChain.length > branchTier) {
                group.push(item);
            } else {
                parentItemHeader = item;
            }
        })
        return (
            <div key={label} className={`cart-item${(branchTier < 5 ? " branch" : "")}${isOnlyChild ? " hide" : " show"}`}>
                <CartContainer
                    branchTier={branchTier}
                    label={label}
                    parentItemHeader={parentItemHeader}
                    items={group}
                    isOnlyChild={isOnlyChild}
                    updateCart={props.updateCart}
                />
            </div>
        )
    } else {
        let itemQuantity = content[0].quantity.actual;
        if (!content[0].parent || content[0].parent && content[0].isOption) {
            itemQuantity =
                <SuperInput
                    value={content[0].quantity.actual}
                    updateValue={(q) => props.updateCart(content[0].details, content[0].branchChain.join("~"), q)}
                />
        }
        return (
            <div key={label} className="cart-item">
                <ul className={`${content[0].isOption ? "option" : ""} ${content[0].parent ? "child" : "adult"}`}>
                    <li className="cart-col">•</li>
                    <li className="cart-col quantity numeric">
                        <div className="super-input-container">
                            {itemQuantity}
                        </div>
                    </li>
                    <li className="cart-col name">{content[0].name}</li>
                    <li className="cart-col rate numeric">{content[0].rate.toFixed(2)}</li>
                </ul>
            </div>
        )  
    }

}

export default CartItem;