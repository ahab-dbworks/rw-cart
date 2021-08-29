import React from 'react';
import CartContainer from './cartContainer';
import SuperInput from './superInput';

const CartItem = (props) => {
    const { branchTier, label, content, isOnlyChild } = props;

    let parentItem = undefined;
    if (content.length > 1 || branchTier < 5) {
        let group = [];
        content.forEach(item => {
            if (item.branchChain.length > branchTier) {
                group.push(item);
            } else {
                parentItem = item;
            }
        })
        return (
            <div key={label} className={`cart-item${(branchTier < 5 ? " branch" : "")}${isOnlyChild ? " hide" : " show"}`}>
                <CartContainer
                    branchTier={branchTier}
                    label={label}
                    parentItem={parentItem}
                    items={group}
                    isOnlyChild={isOnlyChild}
                    updateCart={props.updateCart}
                    addNote={props.addNote}
                />
            </div>
        )
    } else {
        let itemQuantity = content[0].quantity.actual;
        if (!content[0].parent || content[0].parent && content[0].isOption) {
            itemQuantity =
                <SuperInput
                    value={content[0].quantity.actual}
                    updateValue={(q) => props.updateCart(content[0], q)}
                />
        }
        return (
            <div key={label} className="cart-item">
                <ul className={`${content[0].isOption ? "option" : ""} ${content[0].parent ? "child" : "adult"}`}>
                    <li className="cart-col bullet">•</li>
                    <li className="cart-col quantity">
                        <div className="super-input-container">
                            {itemQuantity}
                        </div>
                    </li>
                    <li className="cart-col name" onClick={() => props.addNote(content[0])}>
                        {(content[0].note != "" ? <i>sticky_note_2</i> : "")}
                        <div>{content[0].description}</div>
                    </li>
                    <li className="cart-col rate numeric">{content[0].rate.toFixed(2)}</li>
                </ul>
            </div>
        )  
    }

}

export default CartItem;