import './App.css';
import React from 'react';
import Catalog from './Components/catalog';
import Cart from './Components/cart';
import SuperSelect from './Components/superSelect';
import SuperDate from './Components/superDate';
import RadioButton from './Components/radio';
import Loader from './loader';
import _ from 'lodash';


const APIURL = 'https://demo.rentalworksweb.com/api/v1';
const ACTIVITYLIST = [
  {
    name: "RENTAL",
    code: "R",
    label: "Rental"
  },
  {
    name: "SALES",
    code: "S",
    label: "Sales"
  },
  {
    name: "PARTS",
    code: "P",
    label: "Parts"
  }
  // {
  //   name: "labor",
  //   code: "L",
  //   label: "Labor"
  // },
  // {
  //   name: "misc",
  //   code: "M",
  //   label: "Misc"
  // }
]

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      route: "home",
      credentials: null,
      activity: ACTIVITYLIST[0],
      inventoryType: null,
      category: null,
      subCategory: null,
      warehouse: null,
      customer: "",
      email: "",
      cartList: {},
      startDate: new Date(),
      endDate: new Date(),
      quotePeriod: 1,
      cartMode: "out"
    };
  }

  addItemToCart = async(item, addedItemBranchChain, q) => {
    const { cartList, activity, warehouse, inventoryType, category } = this.state;
    const popCart = _.isEmpty(cartList)
    const loadAccessories = async (parent) => {
      const accessories = await this.getAccessories(parent.id);
      const accessoryList = await Promise.all(accessories.Rows.map(async (acc, i) => {
        return await packageItem(acc, i, parent);
      }))
    }
    const packageItem = async (item, index, parent) => {
      const defaultQuantity = parent ? item[52] : 1; //item[52] is "defaultQuantity"
      let itemPackage = {
        branchChain: parent ? [...parent.branchChain, item[7] + "x" + item[0]] : [activity.name, warehouse.name, inventoryType.name, category.name, item[7]],
        quantity: {
          actual: item[51] ? 0 : Math.ceil(defaultQuantity * q),
          fraction: item[51] ? 0 : defaultQuantity * q,
          default: defaultQuantity
        },
        available: item[22],
        details: item,
        icode: item[5],
        id: item[2],
        index: index,
        name: item[7],
        parent: parent,
        rate: item[35],
        type: item[19],
        isOption: item[51],
        isShort: false,
        activity: activity,
        warehouse: warehouse,
        inventoryType: inventoryType,
        category: category
      }
      if (itemPackage.type != "ITEM" && itemPackage.type != "ACCESSORY") {
        await loadAccessories(itemPackage);
      }
      cartList[itemPackage.branchChain.join("~")] = itemPackage;
    }

    // correct q if greater than supply
    console.log("q is", q, "and availability is", item[22]);
    q = Math.min(q, item[22]);
    
    //add item or update quantity?
    if (cartList[addedItemBranchChain]) {
      Object.keys(cartList).forEach(key => {
        if (key.indexOf(addedItemBranchChain) === 0) {
          if (q <= 0 && !cartList[addedItemBranchChain].isOption) {
            delete cartList[key];
          } else {
            // updating fraction value
            if (!cartList[key].isOption) {
              cartList[key].quantity.fraction = (cartList[key].quantity.default * q);
            } else if (cartList[key].isOption && key === addedItemBranchChain) {
              cartList[key].quantity.fraction = q;
            }
            // correcting negative fraction values
            if (cartList[key].quantity.fraction < 0) {
              cartList[key].quantity.fraction = 0;
            }
            // setting actual to next-highest whole num of fraction
            cartList[key].quantity.actual = Math.ceil(cartList[key].quantity.fraction);
          }
        }
      })
    } else {
      if (!item[51] && q != 0) await packageItem(item);
    }

    //
    if (popCart) {
      this.toggleCart("in");
    }
    console.log("cartList:", cartList);
    this.setState({ cartList: cartList });
  }

  clearCart = () => {
    this.setState({ cartList: {} })
  }

  changeRoute = (route) => {
    this.setState({ route: route });
  }

  getCategories = async () => {
    const { credentials, activity, inventoryType } = this.state;
    if (this.state.inventoryType) {
      this.page = 1;
      const resp = await fetch(`${APIURL}/${activity.name}category/browse`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          'orderby': 'Category',
          'searchfieldoperators': ['<>', '='],
          'searchfields': ['Inactive', 'InventoryTypeId'],
          'searchfieldtypes': ['Text', 'Text'],
          'searchfieldvalues': ['T', `${inventoryType.id}`],
          'searchseparators': [',']
        })
      })
        .catch(err => console.log(err));
      //
      const categories = await resp.json();
      let categoryList = {};
      categories.Rows.forEach((category, i) => {
        categoryList[category[2]] = {
          id: category[2],
          value: category[2],
          name: category[3],
          label: category[3],
          index: i
        }
      });
      return categoryList;
    } else {
      return undefined;
    }
  }

  getCredentials = () => {
    fetch(`${APIURL}/jwt`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        UserName: 'joshua',
        Password: 'icardius'
      })
    })
      .then(response => response.json())
      .then(res => {
        console.log("api credentials:",res);
        this.setState({ credentials: res });
      })
      .catch((err, res) => { console.log(err, "response:", res) });
  }

  getInventory = async () => {
    const { warehouse, activity, inventoryType, category, startDate, endDate } = this.state;
    if (warehouse && inventoryType && category) {
      const resp = await fetch(`${APIURL}/inventorysearch/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.state.credentials.access_token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          'OrderId': '0000KG53',
          'SessionId': '0000KG53',
          'CurrencyId': '0000000E',
          'WarehouseId': warehouse.id,
          'AvailableFor': activity.code,
          'InventoryTypeId': inventoryType.id,
          'CategoryId': category.id,
          'Classifiction': '',
          'FromDate': startDate,
          'ToDate': endDate,
          'HideInventoryWithZeroQuantity': true,
          'ShowAvailability': true,
          'ShowImages': true
        })
      })
        .catch(err => console.log("error:", err));
      const inventory = await resp.json();
      console.log("loaded inventory:", inventory);
      return inventory;
    } else {
      return null;
    }
  }

  getAccessories = async (parentId) => {
    const { warehouse, activity, inventoryType, category, startDate, endDate } = this.state;
    if (warehouse && inventoryType && category) {
      const resp = await fetch(`${APIURL}/inventorysearch/accessories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.state.credentials.access_token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          'OrderId': '0000KG53',
          'SessionId': '0000KG53',
          'Lineage': parentId,
          'WarehouseId': warehouse.id,
          'FromDate': startDate,
          'ToDate': endDate,
          'ShowAvailability': true,
          'ShowImages': true
        })
      })
        .catch(err => console.log("error:", err));
      const accessories = await resp.json();
      console.log("loaded accessories:", accessories);
      return accessories;
    } else {
      return null;
    }
  }

  getInventoryTypes = async (filter) => {
    const { credentials, activity, warehouse } = this.state;
    const resp = await fetch(`${APIURL}/inventorytype/browse`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.access_token}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        'orderby': 'OrderBy',
        'searchfieldoperators': ['<>', "="],
        'searchfields': ['Inactive', activity.label],
        'searchfieldtypes': ['Text', 'Boolean'],
        'searchfieldvalues': ['T', true]
      })
    })
      .catch(err => console.log(err));
    //
    const types = await resp.json();
    let inventoryTypeList = {};
    types.Rows.forEach((type, i) => {
      inventoryTypeList[type[0]] = {
        id: type[0],
        value: type[0],
        name: type[1],
        label: type[1],
        index: i
      }
    });
    return inventoryTypeList;
  }

  getWarehouses = async (filter) => {
    const resp = await fetch(`${APIURL}/warehouse/browse`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.state.credentials.access_token}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        'orderby': 'Warehouse',
        'searchfieldoperators': ['<>'],
        'searchfields': ['Inactive'],
        'searchfieldtypes': ['Text'],
        'searchfieldvalues': ['T']
      })
    })
      .catch(err => console.log(err));

    const warehouses = await resp.json();
    let warehouseList = {};
    warehouses.Rows.forEach((warehouse, i) => {
      warehouseList[warehouse[0]] = {
        id: warehouse[0],
        value: warehouse[0],
        name: warehouse[1],
        label: warehouse[1],
        code: warehouse[2],
        index: i
      }
    })
    return warehouseList;
  }

  setCategory = (e) => {
    if (!e) {
      console.log("category not set");
    } else {
      this.setState({ category: e });
    }
  }

  setDates = (dates) => {
    const [start, end] = dates;
    const quotePeriod = this.getNumberOfDays(start, end);
    this.setState({ startDate: start, endDate: end, quotePeriod: quotePeriod });
  }

  setInventoryType = (e) => {
    if (!e) {
      console.log("inventoryType not set");
    } else {
      this.setState({ inventoryType: e, category: null});
    }
  }

  setActivity = (e) => {
    this.setState({ activity: e, inventoryType: null });
  }

  setWarehouse = (e) => {
    if (!e) {
      console.log("warehouse not set");
    } else {
      this.setState({ warehouse: e });
    }
  }

  submitQuote = () => {

  }

  checkAvailability = (inventoryId, start, end) => {
    fetch(`${APIURL}/inventoryavailability/getinventoryavailability`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.state.credentials.access_token}`,
        'content-type': 'application/json'
      },
      body: {
        InventoryId: inventoryId,
        Warehouse: this.state.warehouse,
        FromDate: start,
        ToDate: end
      }
    })
  }

  toggleCart = (mode) => {
    const { cartMode } = this.state;
    let newMode = undefined;
    if (typeof mode === "string") {
      newMode = mode;
    } else {
      newMode = cartMode === "in" ? "out" : "in";
    }
    this.setState({ cartMode: newMode });
  }

  getNumberOfDays = (start, end) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const oneDay = 1000 * 60 * 60 * 24;
    const diffInTime = d2.getTime() - d1.getTime();
    const diffInDays = Math.round(diffInTime / oneDay);
    return diffInDays + 1;
  }

  componentDidMount() {
    this.getCredentials();
  } 

  render() {
    const { route, warehouse, activity, inventoryType, category, subcategory, startDate, endDate, quotePeriod, cartList, cartMode } = this.state;
    //console.log("App render with state:", this.state);
    //
    let headerSection, paramColumn, catalogColumn, cartColumn, cartSwitch, mainApp = undefined;
    //
    switch (route) {
      case 'home':
        headerSection = 
        <div className="header-banner">
          <div className="banner-content">
            <h1>Welcome!</h1>
          </div>
          <div className="banner-background">
            <img src="https://h7f7z2r7.stackpathcdn.com/sites/default/files/images/articles/blakcstonemain.jpg"/>
          </div>
        </div>

        catalogColumn =
        <div>
          
        </div>
        break;
      case 'catalog':
        if (this.state.credentials) {
          switch (this.state.credentials.statuscode) {
            case 0:
              paramColumn =
                <div className="column left">
                  <div className="column-header param-set">
                    <h1><i>tune</i>PARAMETERS</h1>
                  </div>
                  <div className="param-set">
                    <SuperDate
                      startDate={startDate}
                      endDate={endDate}
                      mode="start"
                      setDates={this.setDates}
                    />
                    <SuperDate
                      startDate={startDate}
                      endDate={endDate}
                      mode="end"
                      setDates={this.setDates}
                    />
                  </div>
                  <div className="param-set">
                    <RadioButton
                      name="Activity Type"
                      options={ACTIVITYLIST}
                      selected={activity.name}
                      action={this.setActivity}
                    />
                  </div>
                  <div className="param-set">
                    <SuperSelect
                      name="warehouse"
                      loader={this.getWarehouses}
                      action={this.setWarehouse}
                      reloadOn={[activity]}
                      placeholder="Select a Warehouse"
                      searchable={false}
                      preload
                    />
                  </div>
                  <div className="param-set">
                    <SuperSelect
                      name="Inventory Type"
                      loader={this.getInventoryTypes}
                      action={this.setInventoryType}
                      reloadOn={[activity, warehouse]}
                      placeholder="Select an Inventory Type"
                      searchable={true}
                      value={inventoryType}
                    // preload
                    />
                  </div>
                  <div className="param-set">
                    <SuperSelect
                      name="category"
                      loader={this.getCategories}
                      action={this.setCategory}
                      reloadOn={[activity, warehouse, inventoryType]}
                      placeholder="Select a Category"
                      searchable={true}
                      value={category}
                    />
                  </div>
                </div>
  
              catalogColumn =
                <div className="column center">
                  <div className="column-header param set">
                    <h1><i>menu_book</i>{activity.label.toUpperCase()} CATALOG</h1>
                  </div>
                  <Catalog
                    loader={this.getInventory}
                    getAccessories={this.getAccessories}
                    activity={activity}
                    warehouse={warehouse}
                    inventoryType={inventoryType}
                    category={category}
                    startDate={startDate}
                    endDate={endDate}
                    addItemToCart={this.addItemToCart}
                    cart={cartList}
                  />
                </div>
  
              cartColumn =
                <div className="column right">
                  <div className="column-header param-set">
                    <h1><i>shopping_cart</i>CART</h1>
                  </div>
                  <Cart
                    cartList={cartList}
                    activityList={ACTIVITYLIST}
                    quotePeriod={quotePeriod}
                    updateCart={this.addItemToCart}
                    clearCart={this.clearCart}
                    submitQuote={this.submitQuote}
                  />
                  <div className="cart-submit">
                    <div className="text-button dim" onClick={this.clearCart}><i>delete_forever</i><span>Clear Cart</span></div>
                    <div className="text-button" onClick={this.submitQuote}><i>send</i><span>Submit Quote</span></div>
                  </div>
                </div>
  
              cartSwitch =
                <div className="slide-panel-switch" onClick={this.toggleCart}>
                  {
                    cartMode === "in" ? <i>logout</i> : <i>shopping_cart</i>
                  }
                </div>
              
              mainApp =
                <article>
                  <div className="body-margin"></div>
                  <div className="body-main">
                    {paramColumn}
                    {catalogColumn}
                  </div>
                  <div className="body-margin">
                    {cartSwitch}
                    <div className={`slide-panel ${cartMode}`}>
                      {cartColumn}
                    </div>
                  </div>
                </article>
              break;
            case undefined:
              catalogColumn = <div className="modal"><Loader /></div>
              break;
            default:
              console.log("there was a problem loading your credentials");
          }
        } else {
          mainApp = <div className="modal abs"><Loader input="CONNECTING TO DATABASE"/></div>
        }
        break;
      default:
        break;
    }

    return (
      <div className="App">
        <header>
          <nav>
            <div className="margin-left">

            </div>
            <div className="main-nav">
              <ul>
                <li onClick={() => this.changeRoute('catalog')}>Get a Quote</li>
                <li>Call an Agent</li>
                <li>Our Website</li>
                <li>News</li>
              </ul>
            </div>
            <div className="margin-right">
            </div>
          </nav>
          {headerSection}
        </header>
        {mainApp}
      </div>
    );
  }
}

export default App;