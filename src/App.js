import './App.css';
import React from 'react';
import Parameters from './Components/parameters';
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
import HomePage from './HomePage';
import config from './config.json';
import _ from 'lodash';

const APIURL = config.url;
const DEFAULTLOGIN = config.defaultLogin;
const ACTIVITYLIST = config.activityList;
const FETCHINVENTORYMETHOD = config.fetchInventoryMethod;

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      credentials: null,
      session: null,
      //
      cartList: {},
      cartMode: "out",
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
      },
      route: "catalog",
      mainModal: null,
      //
      activity: ACTIVITYLIST[0],
      inventoryType: null,
      category: null,
      subCategory: null,
      //
      customer: "",
      email: "",
      startDate: new Date(),
      endDate: new Date(),
      quotePeriod: 1,
      showColorModal: false,
      warehouse: {
        loaded: false
      },
      FETCHINVENTORYMETHOD: "browse"
    }
  }

  addItemToCart = async(item, q) => {
    const { cartList } = this.state;
    const popCart = _.isEmpty(cartList)
    const tierLevels = 3;

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
      // correct q if greater than supply
      const adjustedQ = Math.max(Math.min(q, item.available), 0);
      
      item.quantity.fraction = item.quantity.default * adjustedQ;
      item.quantity.actual = Math.ceil(item.quantity.fraction);
      cartList[item.address] = item;
    }

    
    //add item or update quantity?
    if (cartList[item.address]) {
      Object.keys(cartList).forEach(key => {
        if (key.indexOf(item.address) === 0) {
          if (q <= 0 && !cartList[item.address].isOption) {
            delete cartList[key];
          } else {
            const adjustedQ = Math.max(Math.min(q, item.available), 0);
            // updating fraction value
            if (!cartList[key].isOption) {
              cartList[key].quantity.fraction = (cartList[key].quantity.default * adjustedQ);
            } else if (cartList[key].isOption && key === item.address) {
              cartList[key].quantity.fraction = adjustedQ;
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

  getInventoryTypes = async () => {
    const { credentials, activity } = this.state;
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
        name: "InventoryType",
        label: type[1],
        index: i,
        loadChildren: () => this.getCategories([type[0]])
      }
      inventoryTypeList[type[0]].setter = () => this.setInventoryType(inventoryTypeList[type[0]]);
    });
    console.log("inventoryTypeList:", inventoryTypeList);
    return inventoryTypeList;
  }

  getCategories = async ([inventoryTypeId]) => {
    const { credentials, activity } = this.state;
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
        'searchfieldvalues': ['T', `${inventoryTypeId}`],
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
        name: "Category",
        label: category[3],
        index: i,
        loadChildren: () => this.getSubCategories([inventoryTypeId, category[2]]),
      }
      categoryList[category[2]].setter = () => this.setCategory(categoryList[category[2]])
    });
    return categoryList;
  }
  
  getSubCategories = async ([inventoryTypeId, categoryId]) => {
    const { credentials, activity } = this.state;
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
        'searchfieldvalues': ['T', `${inventoryTypeId}`, `${categoryId}`, `${activity.code}`],
        'searchseparators': [',',',',',',',']
      })
    })
      .catch(err => console.log(err));
    //
    const subcategories = await resp.json();
    let subcategoryList = {};
    subcategories.Rows.forEach((subcategory, i) => {
      subcategoryList[subcategory[0]] = {
        id: subcategory[0],
        value: subcategory[0],
        name: "SubCategory",
        label: subcategory[1],
        index: i,
        loadChildren: () => {return null},
      }
      subcategoryList[subcategory[0]].setter = () => this.setSubCategory(subcategoryList[subcategory[0]])
    });
    return subcategoryList;
  }

  getCredentials = (name=DEFAULTLOGIN.name, pass=DEFAULTLOGIN.password) => {
    fetch(`${APIURL}/jwt`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        UserName: name,
        Password: pass
      })
    })
      .then(response => response.json())
      .then(res => {
        console.log("api credentials:", res);
        this.setState({ credentials: res });
        this.getSession();
      })
      .catch((err, res) => { console.log(err, "response:", res) });
  }

  getSession = () => {
    const { credentials } = this.state;
    fetch(`${APIURL}/account/session?applicationid=0A5F2584-D239-480F-8312-7C2B552A30BA`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${credentials.access_token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(res => {
        console.log("session info:", res);
        this.setState({ session: res });
        this.initialConfig();
      })
      .catch((err, res) => { console.log(err, "response:", res) });
  }

  getInventory = async (searchTerm="", page=1) => {
    const { credentials, session, warehouse, activity, inventoryType, category, subCategory, startDate, endDate } = this.state;
    console.log("loading inventory with", inventoryType, category, subCategory);
    let resp = null;
    switch (FETCHINVENTORYMETHOD) {
      case "search":
        console.log("using SEARCH method");
        resp = await fetch(`${APIURL}/inventorysearch/search`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${credentials.access_token}`,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            'OrderId': session.webUser.webuserid,
            'SessionId': session.webUser.webuserid,
            'CurrencyId': '0000000E',
            'WarehouseId': warehouse.id,
            'AvailableFor': activity.code,
            'InventoryTypeId': inventoryType.id,
            'CategoryId': (category ? category.id : null),
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
        break;
      //
      case "browse":
        console.log("using BROWSE method");
        const searchValues = [inventoryType, category, subCategory, searchTerm];
        const searchParams = {
          searchCondition: [],
          seachFieldOperators: ["<>"],
          searchFields: ["Inactive"],
          searchFieldTypes: ["text"],
          searchFieldValues: ["T"],
          searchSeparators: []
        }
        console.log("loading with parameters:", searchParams);
        let fieldOperator, fieldName, fieldValue = "";
        searchValues.forEach(value => {
          if (value != null && value != "") {
            if (typeof value === "string") {
              fieldOperator = "like";
              fieldName = "DescriptionWithAkas";
              fieldValue = searchTerm;
            } else {
              fieldOperator = "=";
              fieldName = value.name;
              fieldValue = value.label
            }
            searchParams.searchCondition.push("and");
            searchParams.seachFieldOperators.push(fieldOperator);
            searchParams.searchFields.push(fieldName);
            searchParams.searchFieldTypes.push("text");
            searchParams.searchFieldValues.push(fieldValue);
            searchParams.searchSeparators.push(",");
          }
        })
        resp = await fetch(`${APIURL}/rentalinventory/browse`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${credentials.access_token}`,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            'module': 'Renta;Inventory',
            'orderby': 'DescriptionWithAkas asc',
            'pageno': page,
            'pagesize': 25,
            'searchcondition': searchParams.searchCondition,
            'searchconjunctions': [],
            'searchfieldoperators': searchParams.seachFieldOperators,
            'searchfields': searchParams.searchFields,
            'searchfieldtypes': searchParams.searchFieldTypes,
            'searchfieldvalues': searchParams.searchFieldValues,
            'searchseparators': searchParams.searchSeparators,
            'top': 0,
            'uniqueids': { WarehouseId: warehouse.id }
            //
          })
        })
          .catch(err => console.log("error:", err));
        
        break;
      default:
        console.log("there was an error with th value");
        break;
    }
    //
    const inventoryReturn = await resp.json();
    console.log("loaded inventory:", inventoryReturn);
    const inventory = inventoryReturn.Rows.map((row, i) => {
      return this.itemObjectBuilder(row, i, FETCHINVENTORYMETHOD);
    });
    console.log("packaged Inventory:", inventory);
    return {
      inventory: inventory,
      pageNo: inventoryReturn.PageNo,
      totalPages: inventoryReturn.TotalPages,
      totalRows: inventoryReturn.TotalRows
    }
  }

  getAccessories = async (parent) => {
    const { credentials, session, warehouse, startDate, endDate } = this.state;
    const resp = await fetch(`${APIURL}/inventorysearch/accessories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.access_token}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        'OrderId': session.webUser.webuserid,
        'SessionId': session.webUser.webuserid,
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
    const accessoryList = loadedAccessories.Rows.map((row, i) => {
      return this.itemObjectBuilder(row, i, "search", parent);
    });
    console.log("packaged Accessories", accessoryList);
    return accessoryList;
  }

  itemObjectBuilder = (item, i, fetchMethod, parent = null) => {
    const { activity, inventoryType, category, subCategory } = this.state;
    const categoryName = category ? category.name : "";
    const subCategoryName = subCategory ? subCategory.name : "";
    const defaultQuantity = parent ? item[52] : 1; //item[52] = "default quantity"
    let itemObject = {};
    switch (fetchMethod) {
      case "search":
        itemObject = {
          activity: activity,
          inventoryType: inventoryType,
          category: category,
          subCategory: subCategory,
          //
          available: item[22],//                                                    inv type/ category/ sub-cat
          branchChain: parent ? [...parent.branchChain, item[7] + "x" + item[0]] : [item[12], item[14], item[16], item[7]],
          details: item,
          hasChildren: item[19] === "KIT" || item[19] === "COMPLETE",
          iCode: item[5],
          id: item[0],
          inventoryId: item[2],
          imgSrc: `${APIURL}/appimage/getimage?appimageid=${item[45]}&thumbnail=false`,
          imgID: item[45],
          index: i,
          isOption: item[51],
          isShort: false,
          label: item[7],
          lineage: item[3],
          note: "",
          nodeChildren: {},
          parent: parent,
          quantity: {
            actual: 0,
            fraction: item[51] ? 0 : defaultQuantity, //item[51] = "is option"
            default: defaultQuantity
          },
          rate: item[35],
          type: item[19]
        }
        break;
      case "browse":
        itemObject = {
          activity: activity,
          inventoryType: inventoryType,
          category: category,
          subCategory: subCategory,
          //
          available: 1       ,//                                                    inv type/ category/ sub-cat
          branchChain: parent ? [...parent.branchChain, item[196] + "x" + i] : [item[156], item[199], item[202], item[196]],
          details: item,
          hasChildren: item[204] === "KIT" || item[204] === "COMPLETE",
          iCode: item[195],
          id: i,
          inventoryId: item[155],
          imgSrc: "",
          imgID: "",
          index: i,
          isOption: false,
          isShort: false,
          label: item[196],
          lineage: item[3],
          note: "",
          nodeChildren: {},
          parent: parent,
          quantity: {
            actual: 0,
            fraction: 1,
            default: 1
          },
          rate: item[173],
          type: item[204]
        }
        break;
      default:
        break;
      
    }
    itemObject.updateCartQuantity = (q) => this.addItemToCart(itemObject, q);
    itemObject.loadChildren = () => this.getAccessories(itemObject);
    itemObject.displayNote = () => this.displayNote(itemObject);
    itemObject.picPreview = () => this.picPreview(itemObject);
    itemObject.loadBrowseImage = () => this.loadBrowseImage(item[155], itemObject);
    itemObject.address = itemObject.branchChain.join("~");
    return itemObject;
  }
  
  getWarehouse = async (warehouseId) => {
    const resp = await fetch(`${APIURL}/warehouse/${warehouseId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.state.credentials.access_token}`,
        'content-type': 'application/json'
      }
    })
      .catch(err => console.log(err));
    return await resp.json();
  }

  delimiter = (amount) => {
    let commaAmount = "";
    const textAmount = amount.toFixed(2);
    const sep = textAmount.length > 6 ? "," : "";
    textAmount.split("").reverse().forEach((n, i) => {
      if (i > 4) {
        commaAmount =  n + (i % 3 === 0 ? sep : "") + commaAmount;
      } else {
        commaAmount =  n + commaAmount;
      }
    })
    return commaAmount ;
  }

  // getWarehouses = async (filter) => {
  //   const resp = await fetch(`${APIURL}/warehouse/browse`, {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${this.state.credentials.access_token}`,
  //       'content-type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       'orderby': 'Warehouse',
  //       'searchfieldoperators': ['<>'],
  //       'searchfields': ['Inactive'],
  //       'searchfieldtypes': ['Text'],
  //       'searchfieldvalues': ['T']
  //     })
  //   })
  //     .catch(err => console.log(err));

  //   const warehouses = await resp.json();
  //   let warehouseList = {};
  //   warehouses.Rows.forEach((warehouse, i) => {
  //     warehouseList[warehouse[0]] = {
  //       id: warehouse[0],
  //       value: warehouse[0],
  //       name: warehouse[1],
  //       label: warehouse[1],
  //       code: warehouse[2],
  //       index: i
  //     }
  //   })
  //   return warehouseList;
  // }

  loadBrowseImage = async (id, item) => {
    const imgResp = await fetch(`${APIURL}/appimage/getimages?uniqueid1=${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.state.credentials.access_token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(res => {
        if (res) {
          if (res.length > 0) {
            item.imgID = res[0].AppImageId;
            return `${APIURL}/appimage/getimage?appimageid=${res[0].AppImageId}&thumbnail=false`;
          }
        }
        return null;
      })

      .catch((err, res) => { console.log(err, "response:", res) });
    return imgResp;
  }

  picPreview = (item) => {
    const picHTML = <PictureModal src={`${APIURL}/appimage/getimage?appimageid=${item.imgID}&thumbnail=false`} title={item.label} cancel={() => this.setMainModal(null)} />;
    this.setMainModal(picHTML);
  }

  setMainModal = (modalHTML) => {
    this.setState({ mainModal: modalHTML });
  }

  setInventoryType = (e) => {
    if (!e) {
      console.log("inventoryType not set");
    } else {
      console.log("setting InventoryType to", e);
      this.setState({ inventoryType: e, category: null, subCategory: null });
    }
  }

  setCategory = (e) => {
    if (!e) {
      console.log("category not set");
    } else {
      console.log("setting Category to", e);
      this.setState({ category: e, subCategory: null });
    }
  }

  setSubCategory = (e) => {
    if (!e) {
      console.log("subcategory not set");
    } else {
      console.log("setting Sub-Category to", e);
      this.setState({ subCategory: e });
    }
  }

  setDates = (dates) => {
    const [start, end] = dates;
    const quotePeriod = this.getNumberOfDays(start, end);
    this.setState({ startDate: start, endDate: end, quotePeriod: quotePeriod });
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

  initialConfig = async () => {
    //set branding colors
    this.setColors(this.state.colors);

    //load warehouse
    if (this.state.credentials) {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const warehouseId = config.warehouses[urlParams.get('warehouse')];
      let warehouse = {
        loaded: false
      }
      if (warehouseId) {
        const warehouseDetails = await this.getWarehouse(warehouseId);
        warehouse = {
          loaded: true,
          id: warehouseDetails.WarehouseId,
          value: warehouseDetails.WarehouseId,
          name: warehouseDetails.Warehouse,
          label: warehouseDetails.Warehouse,
          code: warehouseDetails.WarehouseCode,
          index: 0
        }
      } else {
        console.log("no warehouse specified");
      }
      this.setWarehouse(warehouse);
    }
  }

  componentDidMount() {
    this.getCredentials();
  } 

  render() {
    const { credentials, route, mainModal, activity, inventoryType, category, subCategory, startDate, endDate, quotePeriod, cartList, cartMode, showColorsModal, colors, warehouse } = this.state;
    //console.log("App render with state:", this.state);
    //
    let colorzModal, paramColumn, catalogColumn, cartColumn, mainApp = undefined;
    const addressChain = <div className="address-chain">
      {
        [inventoryType, category, subCategory].map(tier => {
          if (tier) {
            return (
              <div className="chain-link">
                <div className="link-spacer">></div>
                <div className="link-label" onClick={tier.setter}>{tier.label}</div>
              </div>
            )
          }
        })
      }
    </div>
    //
    this.renderColors();
    const { primary, secondary, background } = colors;
    //
    switch (route) {
      case 'home':
        mainApp = <HomePage/>
        break;
      case 'catalog':
        if (credentials) {
          if (warehouse.loaded) {
            if (this.state.credentials) {
    
              switch (this.state.credentials.statuscode) {
                case 0:
                  colorzModal = <Colorz colors={colors} setColors={this.setColors} />;
                  paramColumn = <Parameters
                    startDate={startDate}
                    endDate={endDate}
                    setDates={this.setDates}
                    contrastColor={primary.contrast}
                    warehouse={warehouse}
                    getInventoryTypes={this.getInventoryTypes}
                    setInventoryType={this.setInventoryType}
                    getCategories={this.getCategories}
                    setCategory={this.setCategory}
                    getSubCategories={this.getSubCategories}
                    setSubCategory={this.setSubCategory}
                    inventoryType={inventoryType}
                    category={category}
                  />
                  //
                  catalogColumn = <Catalog
                    delimiter={this.delimiter}
                    loader={this.getInventory}
                    addressChain={addressChain}
                    activity={activity}
                    inventoryType={inventoryType}
                    category={category}
                    subCategory={subCategory}
                    startDate={startDate}
                    endDate={endDate}
                    cart={cartList}
                    fetchInventoryMethod={FETCHINVENTORYMETHOD}
                  />
                  //
                  cartColumn = <Cart
                    delimiter={this.delimiter}
                    cartMode={cartMode}
                    cartList={cartList}
                    activityList={ACTIVITYLIST}
                    quotePeriod={quotePeriod}
                    clearCart={this.clearCart}
                    submitQuote={this.submitModal}
                    toggleCart={this.toggleCart}
                  />
                  //
                  mainApp = <div className="app-space">
                    {colorzModal}
                    {mainModal}
                    <div className="body-margin"></div>
                    <div className="body-main">
                      <div className="column left">
                        {paramColumn}
                      </div>
                      <div className="column center" style={{ color: background.contrast, borderColor: background.contrast }}>
                        {catalogColumn}
                      </div>
                    </div>
                    <div className="body-margin">
                      <div className="column right">
                        {cartColumn}
                      </div>
                    </div>
                  </div>
                  break;
                case undefined:
                  catalogColumn = <div className="modal"><Loader textColor={background.contrast}/></div>
                  break;
                default:
                  catalogColumn = <div className="modal">ERROR</div>
                  console.log("there was a problem loading your credentials");
              }
            } else {
              mainApp = <div className="modal abs"><Loader input="CONNECTING TO DATABASE" textColor={background.contrast}/></div>
            }
          } else {
            mainApp = <div className="modal" style={{ color: background.contrast}}>This Cart App requires a Warehouse to be specified. Please request a warehouse-specific url from {config.companyName}.</div>
          }
        } else {
          mainApp = <div className="modal" style={{ color: background.contrast}}>There was a problem connecting to the server. Please try again later.<br/>If this issue persists, please contact {config.companyName}.</div>
        }
        break;
      default:
        break;
    }

    return (
      <div className="App">
        <header>
          <nav>
            <div className="body-margin">

            </div>
            <div className="main-nav">
              <ul>
                <li onClick={() => this.changeRoute('home')}>Home</li>
                <li>About Us</li>
                <li>News</li>
                <li>Services</li>
                <li>Call an Agent</li>
                <li onClick={() => this.changeRoute('catalog')}>Get a Quote</li>
              </ul>
            </div>
            <div className="body-margin">
            </div>
          </nav>
        </header>
        {mainApp}
      </div>
    );
  }
}

export default App;