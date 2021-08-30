import React from 'react';
import CartItem from './cartItem';
import SuperInput from './superInput';

class CartContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsedBody: false
        }
    }

    toggle = () => {
        const { collapsedBody } = this.state;
        this.setState({ collapsedBody: !collapsedBody });
    }

    componentDidMount() {
        const {collapseBody} = this.props;
        if (collapseBody) {
            this.setState({ collapsedBody: collapseBody });
        }
    }

    render() {
        const { collapsedBody } = this.state;
        const { isOnlyChild, branchTier, label, parentItem, items } = this.props;
        const collapseBtn = collapsedBody ? "drag_handle" : "view_day";

        let branchGroup = {}
        let branchTierSubTotal = 0;
        items.forEach(item => {
            if (item.branchChain.length === 5 || item.isOption) branchTierSubTotal += item.quantity.actual * item.rate;
            if (!branchGroup[item.branchChain[branchTier]]) {
                branchGroup[item.branchChain[branchTier]] = [];
            }
            branchGroup[item.branchChain[branchTier]].push(item);
        })

        let headerBarContent = undefined;
        if (branchTier < 5) {
            headerBarContent =
                <ul className="branch-header">
                    <li className=""><i className="collapser-button" onClick={this.toggle}>{collapsedBody ? "expand_more" : "expand_less"}</i></li>
                    <li className="cart-col name">{label}</li>
                    <li className="cart-col rate numeric">{branchTierSubTotal.toFixed(2)}</li>
                </ul>
        } else {
            headerBarContent =
                <ul className={`kit-complete-header ${parentItem.parent ? "child" : "adult"}`}>
                    <li className=""><i className="collapser-button" onClick={this.toggle}>{collapsedBody ? "expand_more" : "expand_less"}</i></li>
                    <li className="cart-col quantity numeric">
                        <div className="super-input-container">
                            <SuperInput
                                value={parentItem.quantity.actual}
                                updateValue={(q) => parentItem.updateCartQuantity(q)}
                            />
                        </div>
                    </li>
                    <li className="cart-col name" onClick={parentItem.displayNote}>
                        {(parentItem.note ? <i>sticky_note_2</i> : "")}
                        {parentItem.description}
                    </li>
                    <li className="cart-col rate numeric">{parentItem.rate.toFixed(2)}</li>
                </ul>
        }
        return (
            <div key={label} className={`collapser-container${(parentItem ? " kit-complete" : "")}${(branchTier < 5 ? " branch-container" : "")}${isOnlyChild ? " hidden" : " show"}`}>
                <div className={`collapser-header`}>
                    {headerBarContent}
                </div>
                <ul className={`content-container ${collapsedBody ? "hidden" : "show"}`}>
                    {
                        Object.keys(branchGroup).map(address => {
                            return (
                                <CartItem
                                    branchTier={branchTier + 1}
                                    label={address}
                                    content={branchGroup[address]}
                                    isOnlyChild={Object.keys(branchGroup).length === 1 && branchTier < 4}
                                />
                            )
                        })
                    }
                </ul>
            </div>
        )
    }
}

export default CartContainer;