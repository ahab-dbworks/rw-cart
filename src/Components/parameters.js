import React from 'react';
import SuperDate from './superDate';
import ExpansionMenu from './expansionmenu';
import { Expander, NestedNode } from './nestedexpander.js';
import './styling/parameters.css';

class Parameters extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nodeSeries: undefined
        }
    }

    loadContent = async () => {
        const { getInventoryTypes } = this.props;
        const nodeSeries = await getInventoryTypes();
        this.setState({ nodeSeries: nodeSeries });
    }

    componentDidMount() {
        this.loadContent();
    }

    elementBuilder = (node, i) => {
        return (
            <NestedNode
                nodeKey={i}
                nodeDetail={node}
                nodeLabel={node.label}
                nodeClick={node.setter}
                buttonClosed={'navigate_next'}
                buttonOpen={'expand_more'}
                builder={this.elementBuilder}
                preload
                expansionTrigger={"node"}
                collapseTrigger={"mouse"}
            />
        )
    }

    render() {
        const {
            startDate,
            endDate,
            setDates,
            contrastColor,
            getInventoryTypes,
            setInventoryType,
            getCategories,
            setCategory,
            getSubCategories,
            setSubCategory
        } = this.props;
        //
        const { nodeSeries } = this.state;
        //
        const menuStructure = [
            {
                name: "inventoryTypes",
                label: "Inventory Types",
                idName: "inventoryType",
                loader: getInventoryTypes,
                setter: setInventoryType
            },
            {
                name: "categories",
                label: "Categories",
                idName: "category",
                loader: getCategories,
                setter: setCategory
            },
            {
                name: "subCategories",
                label: "Sub-Categories",
                idName: "subcategory",
                loader: getSubCategories,
                setter: setSubCategory
            }
        ];
        
        return (
            <section className="parameters">
                <h1><i>tune</i>PARAMETERS</h1>
                <div className="column-segment padded">
                    <SuperDate
                        startDate={startDate}
                        endDate={endDate}
                        mode="start"
                        setDates={setDates}
                        textColor={contrastColor}
                    />
                    <SuperDate
                        startDate={startDate}
                        endDate={endDate}
                        mode="end"
                        setDates={setDates}
                        textColor={contrastColor}
                    />
                </div>
                <div className="column-segment types">
                    <Expander
                        nodeSeries={nodeSeries}
                        elementBuilder={this.elementBuilder}
                    />
                    {/* <ExpansionMenu
                        nodeSeries={nodeSeries}
                        menuStructure={menuStructure}
                        idValues={[]}
                        tier={1}
                    /> */}
                </div>
                
            </section>
        );
    }
}

export default Parameters;