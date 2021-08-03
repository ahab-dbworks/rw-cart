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
        const { isOnlyChild, branchTier, label, parentItemHeader, items } = this.props;
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
                    <li className=""><i className="collapser-button" onClick={this.toggle}>{collapsedBody ? "expand_less" : "expand_more"}</i></li>
                    <li className="cart-col name">{label}</li>
                    <li className="cart-col rate numeric">{branchTierSubTotal.toFixed(2)}</li>
                </ul>
        } else {
            headerBarContent =
                <ul className={`kit-complete-header ${parentItemHeader.parent ? "child" : "adult"}`}>
                    <li className=""><i className="collapser-button" onClick={this.toggle}>{collapsedBody ? "expand_less" : "expand_more"}</i></li>
                    <li className="cart-col quantity numeric">
                        <SuperInput
                            value={parentItemHeader.quantity.actual}
                            updateValue={(q) => this.props.updateCart(parentItemHeader.details, parentItemHeader.branchChain.join("~"), q)}
                        />
                    </li>
                    <li className="cart-col name">{parentItemHeader.name}</li>
                    <li className="cart-col rate numeric">{parentItemHeader.rate.toFixed(2)}</li>
                </ul>
        }
        return (
            <div key={label} className={`collapser-container${(parentItemHeader ? " kit-complete" : "")}${(branchTier < 5 ? " branch-container" : "")}${isOnlyChild ? " hidden" : " show"}`}>
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
                                    updateCart={this.props.updateCart}
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