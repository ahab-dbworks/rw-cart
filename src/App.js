import './App.css';
import React from 'react';
import Catalog from './Components/catalog';
import Cart from './Components/cart';
import SuperSelect from './Components/superSelect';
import SuperDate from './Components/superDate';
import RadioButton from './Components/radio';
import Loader from './loader';
import SubmitForm from './Components/submitForm';
import PictureModal from './Components/PictureModal';
import Colorz from './Components/Colorz';
import NoteModal from './Components/noteModal';
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
      mainModal: null,
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
      cartMode: "out",
      showColorModal: false,
      colors: {
        primary: {
          hue: parseInt(getComputedStyle(document.body).getPropertyValue('--primary-hue')),
          sat: parseInt(getComputedStyle(document.body).getPropertyValue('--primary-sat').slice(0,-1)),
          lum: parseInt(getComputedStyle(document.body).getPropertyValue('--primary-lum').slice(0,-1))
        },
        secondary: {
          hue: parseInt(getComputedStyle(document.body).getPropertyValue('--secondary-hue')),
          sat: parseInt(getComputedStyle(document.body).getPropertyValue('--secondary-sat').slice(0,-1)),
          lum: parseInt(getComputedStyle(document.body).getPropertyValue('--secondary-lum').slice(0,-1))
        },
        background: {
          hue: parseInt(getComputedStyle(document.body).getPropertyValue('--background-hue')),
          sat: parseInt(getComputedStyle(document.body).getPropertyValue('--background-sat').slice(0,-1)),
          lum: parseInt(getComputedStyle(document.body).getPropertyValue('--background-lum').slice(0,-1))
        }
      }
    };
  }

  addItemToCart = async(item, q) => {
    const { cartList, activity, warehouse, inventoryType, category } = this.state;
    const popCart = _.isEmpty(cartList)

    const loadAccessories = async (parent) => {
      const accessories = await this.getAccessories(parent);
      await Promise.all(accessories.map(async (acc, i) => {
        await quantizeCartItem(acc);
      }))
    }
    const quantizeCartItem = async (item) => {
      //package item
      if (item.type != "ITEM" && item.type != "ACCESSORY") {
        await loadAccessories(item);
      }
      item.quantity.fraction = item.quantity.default * q;
      item.quantity.actual = Math.ceil(item.quantity.fraction);
      cartList[item.address] = item;
    }

    // correct q if greater than supply
    console.log("q is", q, "and availability is", item.available);
    q = Math.min(q, item.available);
    
    //add item or update quantity?
    if (cartList[item.address]) {
      Object.keys(cartList).forEach(key => {
        if (key.indexOf(item.address) === 0) {
          if (q <= 0 && !cartList[item.address].isOption) {
            delete cartList[key];
          } else {
            // updating fraction value
            if (!cartList[key].isOption) {
              cartList[key].quantity.fraction = (cartList[key].quantity.default * q);
            } else if (cartList[key].isOption && key === item.address) {
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
      if (!item.isOption && q != 0) await quantizeCartItem(item);
    }

    //
    if (popCart) {
      this.toggleCart("in");
    }
    console.log("cartList:", cartList);
    this.setState({ cartList: cartList });
  }

  displayNote = (item) => {
    const noteModal = <NoteModal item={item} submit={this.addNote} cancel={() => this.setMainModal(null)}/>
    this.setMainModal(noteModal);
  }
  
  addNote = (item, note) => {
    const { cartList } = this.state;
    console.log("adding note to:", item, note);
    const address = item.branchChain.join("~");
    cartList[address].note = note;
    this.setState({ cartList: cartList, mainModal: null });
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
  
  getSubCategories = async () => {
    const { credentials, activity, inventoryType, category } = this.state;
    if (this.state.inventoryType) {
      
      const resp = await fetch(`${APIURL}/subcategory/browse`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          'orderby': 'OrderBy',
          // 'uniqueids': {'CategoryId':category.id, 'TypeId':inventoryType.id, 'RecType': activity.code}
          'searchfieldoperators': ['<>', '=', '=', '='],
          'searchfields': ['Inactive', 'TypeId', 'CategoryId', 'RecType'],
          'searchfieldtypes': ['Text', 'Text', 'Text', 'Text'],
          'searchfieldvalues': ['T', `${inventoryType.id}`, `${category.id}`, `${activity.code}`],
          'searchseparators': [',',',',',',',']
        })
      })
        .catch(err => console.log(err));
      //
      const subcategories = await resp.json();
      console.log("fetched sub-categories:", subcategories);
      let subcategoryList = {};
      subcategories.Rows.forEach((subcategory, i) => {
        subcategoryList[subcategory[0]] = {
          id: subcategory[0],
          value: subcategory[0],
          name: subcategory[1],
          label: subcategory[1],
          index: i
        }
      });
      console.log(subcategoryList);
      return subcategoryList;
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
    const { warehouse, activity, inventoryType, category, subCategory, startDate, endDate } = this.state;
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
          'SubcategoryId': (subCategory ? subCategory.id : null),
          'Classifiction': '',
          'FromDate': startDate,
          'ToDate': endDate,
          'HideInventoryWithZeroQuantity': true,
          'ShowAvailability': true,
          'ShowImages': true
        })
      })
        .catch(err => console.log("error:", err));
      const loadedInventory = await resp.json();
      console.log("loaded inventory:", loadedInventory);
      const inventory = loadedInventory.Rows.map((row, i) => {
        return this.itemObjectBuilder(row, i);
      });
      console.log("packaged Inventory:", inventory);
      return inventory;
    } else {
      return null;
    }
  }

  getAccessories = async (parent) => {
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
          'Lineage': parent.inventoryId,
          'WarehouseId': warehouse.id,
          'FromDate': startDate,
          'ToDate': endDate,
          'ShowAvailability': true,
          'ShowImages': true
        })
      })
        .catch(err => console.log("error:", err));
      const loadedAccessories = await resp.json();
      console.log("loaded accessories:", loadedAccessories);
      const accessories = loadedAccessories.Rows.map((row, i) => {
        return this.itemObjectBuilder(row, i, parent);
      });
      console.log("packaged Accessories", accessories);
      return accessories;
    } else {
      return null;
    }
  }

  itemObjectBuilder = (item, i, parent = null) => {
    const { activity, warehouse, inventoryType, category, subCategory } = this.state;
    const defaultQuantity = parent ? item[52] : 1; //item[52] = "default quantity"
    const itemObject = {
      activity: activity,
      warehouse: warehouse,
      inventoryType: inventoryType,
      category: category,
      subCategory: subCategory,
      //
      available: item[22],
      branchChain: parent ? [...parent.branchChain, item[7] + "x" + item[0]] : [activity.name, warehouse.name, inventoryType.name, category.name, item[7]],
      details: item,
      iCode: item[5],
      id: item[0],
      inventoryId: item[2],
      imgSrc: item[46],
      index: i,
      isOption: item[51],
      isShort: false,
      description: item[7],
      lineage: item[3],
      note: "",
      parent: parent,
      quantity: {
        actual: 0,
        fraction: item[51] ? 0 : defaultQuantity, //item[51] = "is option"
        default: defaultQuantity
      },
      rate: item[35],
      type: item[19]
    }
    itemObject.address = itemObject.branchChain.join("~");
    return itemObject;
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

  picPreview = (src, title) => {
    const picHTML = <PictureModal src={src} title={title} cancel={() => this.setMainModal(null)} />;
    this.setMainModal(picHTML);
  }

  setMainModal = (modalHTML) => {
    this.setState({ mainModal: modalHTML });
  }

  setCategory = (e) => {
    if (!e) {
      console.log("category not set");
    } else {
      this.setState({ category: e });
    }
  }

  setSubCategory = (e) => {
    if (!e) {
      console.log("subcategory not set");
    } else {
      this.setState({ subCategory: e });
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

  submitModal = () => {
    const modalHTML =
      <SubmitForm
        submit={this.submitQuote}
        cancel={() => this.setMainModal(null)}
      />
    this.setMainModal(modalHTML);
  }

  submitQuote = (formData) => {
    console.log(formData);
    const modalConfirmation =
    <div className="modal-layer">
        <div className="modal">
          <div id="submitQuote" className="modal-container">
            <div className="modal-header barlow">
              Confirmation
            </div>
            <div className="modal-body" style={{padding:"50px"}}>
              Quote Requested!
            </div>
            <div className="panel-buttons">
              <div className="text-button secondary dim"onClick={() => this.setMainModal(null)}><i>do_disturb</i><span>Close</span></div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop abs" onClick={() => this.setMainModal(null)}></div>
      </div>
    
    this.setState({
      route: "catalog",
      mainModal: modalConfirmation,
      activity: ACTIVITYLIST[0],
      inventoryType: null,
      category: null,
      subcategory: null,
      cartList: {},
      startDate: new Date(),
      endDate: new Date(),
      quotePeriod: 1,
      cartMode: "out"
    })
  }

  // checkAvailability = (inventoryId, start, end) => {
  //   fetch(`${APIURL}/inventoryavailability/getinventoryavailability`, {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${this.state.credentials.access_token}`,
  //       'content-type': 'application/json'
  //     },
  //     body: {
  //       InventoryId: inventoryId,
  //       Warehouse: this.state.warehouse,
  //       FromDate: start,
  //       ToDate: end
  //     }
  //   })
  // }

  showColorsModal = () => {
    this.setState({ showColorsModal: !this.state.showColorsModal });
  }

  setColors = (colors) => {
    Object.keys(colors).forEach(color => {
      colors[color].contrast = "black";
      colors[color].max = "0%";
      colors[color].min = "100%";
      const { hue, lum } = colors[color];
      if (lum < 40) {
        colors[color].contrast = "white";
        colors[color].max = "100%";
        colors[color].min = "0%";
      } else if (lum < 70) {
        if (hue < 45 || hue > 185) {
          colors[color].contrast = "white";
          colors[color].max = "100%";
          colors[color].min = "0%";
        }
      }
    })
    this.setState({ colors: colors });
  }

  renderColors = () => {
    const { colors } = this.state;
    Object.keys(colors).forEach(color => {
      document.body.style.setProperty(`--${color}-hue`, colors[color].hue);
      document.body.style.setProperty(`--${color}-sat`, colors[color].sat + "%");
      document.body.style.setProperty(`--${color}-lum`, colors[color].lum + "%");
      document.body.style.setProperty(`--${color}-contrast`, colors[color].contrast);
      document.body.style.setProperty(`--${color}-max`, colors[color].max);
      document.body.style.setProperty(`--${color}-min`, colors[color].min);
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
    this.setColors(this.state.colors);
    this.getCredentials();
  } 

  render() {
    const { route, mainModal, warehouse, activity, inventoryType, category, subCategory, startDate, endDate, quotePeriod, cartList, cartMode, showColorsModal, colors } = this.state;
    //console.log("App render with state:", this.state);
    //
    let headerSection, colorsModal, paramColumn, catalogColumn, cartColumn, mainApp = undefined;
    //

    this.renderColors();
    const { primary, secondary, background } = colors;
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
              colorsModal = showColorsModal ? <Colorz colors={colors} setColors={this.setColors} /> : "";
              paramColumn =
                <div className="column">
                
                  <div className="parameters" style={{ color: primary.contrast, borderColor: primary.contrast }}>
                    <div className="column-header column-segment">
                      <h1><i>tune</i>PARAMETERS</h1>
                    </div>
                    <div className="column-segment">
                      <SuperDate
                        startDate={startDate}
                        endDate={endDate}
                        mode="start"
                        setDates={this.setDates}
                        textColor={primary.contrast}
                      />
                      <SuperDate
                        startDate={startDate}
                        endDate={endDate}
                        mode="end"
                        setDates={this.setDates}
                        textColor={primary.contrast}
                      />
                    </div>
                    <div className="column-segment">
                      <RadioButton
                        name="Activity Type"
                        options={ACTIVITYLIST}
                        selected={activity.name}
                        action={this.setActivity}
                      />
                    </div>
                    <div className="column-segment select">
                      <SuperSelect
                        name="warehouse"
                        loader={this.getWarehouses}
                        action={this.setWarehouse}
                        reloadOn={[activity]}
                        placeholder="Select a Warehouse"
                        searchable={false}
                        textColor={primary.contrast}
                        preload
                      />
                    </div>
                    <div className="column-segment select">
                      <SuperSelect
                        name="Inventory Type"
                        loader={this.getInventoryTypes}
                        action={this.setInventoryType}
                        reloadOn={[activity, warehouse]}
                        placeholder="Select an Inventory Type"
                        searchable={true}
                        textColor={primary.contrast}
                        value={inventoryType}
                      // preload
                      />
                    </div>
                    <div className="column-segment select">
                      <SuperSelect
                        name="category"
                        loader={this.getCategories}
                        action={this.setCategory}
                        reloadOn={[activity, warehouse, inventoryType]}
                        placeholder="Select a Category"
                        searchable={true}
                        textColor={primary.contrast}
                        value={category}
                      />
                    </div>
                    {/* <div className="column-segment select">
                      <SuperSelect
                        name="sub-category"
                        loader={this.getSubCategories}
                        action={this.setSubCategory}
                        reloadOn={[activity, warehouse, inventoryType, category]}
                        placeholder="Select a Sub-Category"
                        searchable={true}
                        textColor={primary.contrast}
                        value={subCategory}
                      />
                    </div> */}
                  </div>
                </div>
  
              catalogColumn =
                <div className="column center" style={{ color: background.contrast, borderColor: background.contrast }}>
                  <div className="column-header column-segment">
                    <h1><i>menu_book</i>{activity.label.toUpperCase()} CATALOG</h1>
                  </div>
                  <Catalog
                    loader={this.getInventory}
                    getAccessories={this.getAccessories}
                    activity={activity}
                    warehouse={warehouse}
                    inventoryType={inventoryType}
                    category={category}
                    subCategory={subCategory}
                    startDate={startDate}
                    endDate={endDate}
                    addItemToCart={this.addItemToCart}
                    cart={cartList}
                    picPreview={this.picPreview}
                  />
                </div>
  
              cartColumn =
                <div className="column right">
                  <Cart
                    cartMode={cartMode}
                    cartList={cartList}
                    activityList={ACTIVITYLIST}
                    quotePeriod={quotePeriod}
                    updateCart={this.addItemToCart}
                    clearCart={this.clearCart}
                    submitQuote={this.submitModal}
                    toggleCart={this.toggleCart}
                    addNote={this.displayNote}
                  />
                </div>
              
              mainApp =
                <article>
                  {colorsModal}
                  {mainModal}
                  <div className="body-margin"></div>
                  <div className="body-main">
                    {paramColumn}
                    {catalogColumn}
                  </div>
                  <div className="body-margin">
                    {cartColumn}
                  </div>
                </article>
              break;
            case undefined:
              catalogColumn = <div className="modal"><Loader textColor={background.contrast}/></div>
              break;
            default:
              console.log("there was a problem loading your credentials");
          }
        } else {
          mainApp = <div className="modal abs"><Loader input="CONNECTING TO DATABASE" textColor={background.contrast}/></div>
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
                <li onClick={this.showColorsModal}>Our Website</li>
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