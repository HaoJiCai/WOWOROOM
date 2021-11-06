// 定義元素選擇器的變數
const productSelect = document.querySelector(".productSelect");
const searchResultNum = document.querySelector("#searchResult-text");
const productWrap = document.querySelector(".productWrap");
const shoppingCart = document.querySelector(".shoppingCart-table");

const orderInfoForm = document.querySelector(".orderInfo-form");
const orderInfoInputs = document.querySelectorAll(".orderInfo-input");
const orderInfoMessage = document.querySelectorAll(".orderInfo-message");

// 定義重複 API 的變數
const baseURL = "https://livejs-api.hexschool.io";
const api_Customer = "/api/livejs/v1/customer/";
//const api_Admin = "/api/livejs/v1/admin/";
const apiPath = "jimmycai";

let productsList = [];
let cartsList = {};
let selectedProductsType = "全部";

// 事件監聽
productSelect.addEventListener('change', productsType); // 下拉選擇產品種類
productWrap.addEventListener('click', e =>{ // 新增產品
    e.preventDefault();
    if (e.target.nodeName !== "A"){
        return;
    };
    //console.log(e.target.id);
    axiosPostCarts(e.target.id);
});
shoppingCart.addEventListener('click', e =>{ // 刪除所以產品
    e.preventDefault();
    if (e.target.className === "discardAllBtn"){
        axiosDeleteCarts("");
        refreshCarts();
    };
    if (e.target.className === "material-icons"){
        axiosDeleteCarts(e.target.id);
        refreshCarts();
    };
}); 
orderInfoForm.addEventListener('submit', e =>{
    submitForm(e);
});

// GET 產品資料 API
function axiosGetProducts() {
    axios.get(`${baseURL}${api_Customer}${apiPath}/products`).then(data =>{
        //console.log(data);
        productsList = data.data.products;
        //console.log(productsList);
        refreshProducts();
    }).catch(error =>{
        console.log(error);
    });
};

// GET 購物車資料 API
function axiosGetCarts() {
    axios.get(`${baseURL}${api_Customer}${apiPath}/carts`).then(data =>{
        //console.log(data);
        cartsList = data.data;
        console.log(cartsList);
        refreshCarts();
    }).catch(error =>{
        console.log(error);
    });
};

// POST 購物車資料 API
function axiosPostCarts(id) {
    let postObj = {
        "data": {
            "productId": id,
            "quantity": 1
        }
    };
    axios.post(`${baseURL}${api_Customer}${apiPath}/carts`, postObj).then(res =>{
        console.log(res);
        cartsList = res.data;
        refreshCarts();
    }).catch(error =>{
        console.log(error);
    });;
};

// DELETE 購物車資料 API
function axiosDeleteCarts(id) {
    axios.delete(`${baseURL}${api_Customer}${apiPath}/carts/${id}`).then(res =>{
        console.log(res);
        cartsList = res.data;
        refreshCarts();
    }).catch(error =>{
        console.log(error);
    });
};

// Post 訂單資訊 API
function axiosPostOrders() {
    let orderInputArray = [];
    orderInfoInputs.forEach(input =>{
        //console.log(input.value);
        orderInputArray.push(input.value);
    });

    let postObj = {
        "data": {
            "user": {
                "name": orderInputArray[0],
                "tel": orderInputArray[1],
                "email": orderInputArray[2],
                "address": orderInputArray[3],
                "payment": orderInputArray[4]
            }
        }
    };
    console.log(postObj);
    axios.post(`${baseURL}${api_Customer}${apiPath}/orders/`, postObj).then(res =>{
        console.log(res);
        axiosGetCarts();
        orderInfoForm.reset();
    }).catch(error =>{
        console.log(error);
    });
};

// 下拉選擇產品種類
function productsType(e) {
    selectedProductsType = e.target.value;
    axiosGetProducts();
};

// 重新渲染產品列表
function refreshProducts() {
    let showProducts = productsList;
    let productsInfor = "";
    //console.log(selectedProductsType);

    if (selectedProductsType !== "全部"){
        showProducts = productsList.filter(product=>
            product.category === selectedProductsType
        );
    }else {
        showProducts = productsList;
    };

    if (showProducts.length > 0){
        showProducts.forEach(item =>{
            productsInfor += 
            `
                <li class="productCard">
                    <h4 class="productType">${item.category}</h4>
                    <img src= ${item.images} alt="">
                    <a href="#" id=${item.id} class="addCardBtn">加入購物車</a>
                    <h3>${item.title}</h3>
                    <del class="originPrice">NT$${item.origin_price}</del>
                    <p class="nowPrice">NT$${item.price}</p>
                </li>
            `
        });
        productWrap.innerHTML = productsInfor;
        searchResultNum.innerHTML = `本次搜尋共 ${showProducts.length} 筆資料`;
    }else {
        productsInfor = "目前暫無產品資料";
        productWrap.innerHTML = productsInfor;
    };
};

// 重新渲染購物車列表
function refreshCarts() {
    let showCarts = cartsList.carts;
    let cartsInfor = 
    `
        <tr>
            <th width="40%">品項</th>
            <th width="15%">單價</th>
            <th width="15%">數量</th>
            <th width="15%">金額</th>
            <th width="15%"></th>
        </tr>
    `;

    if (showCarts.length > 0){

        showCarts.forEach(item =>{
            let showCarts_product = item.product;
            cartsInfor +=
            `
                <tr>
                    <td>
                        <div class="cardItem-title">
                            <img src=${showCarts_product.images} alt=${showCarts_product.title}>
                            <p>${showCarts_product.title}</p>
                        </div>
                    </td>
                    <td>NT$${showCarts_product.price}</td>
                    <td>${item.quantity}</td>
                    <td>NT$${showCarts_product.price * item.quantity}</td>
                    <td class="discardBtn">
                        <a href="#" id=${item.id} class="material-icons">
                            clear
                        </a>
                    </td>
                </tr>
            `
        });
        cartsInfor += 
        `
            <tr>
                <td>
                    <a href="#" class="discardAllBtn">刪除所有品項</a>
                </td>
                <td></td>
                <td></td>
                <td>
                    <p>總金額</p>
                </td>
                <td>NT$${cartsList.finalTotal}</td>
            </tr>
        `
        shoppingCart.innerHTML = cartsInfor;
    }else {
        shoppingCart.innerHTML = cartsInfor;
    };

};

// 設定錯誤訊息
function showErrorMessage() {
    const constraints = {
        Name: {
            presence: {
                message: "^姓名 為必填欄位！！"
            }
        },
        Phone: {
            presence: {
                message: "^電話 為必填欄位！！"
            },
            length: {
                is: 10,
                message: "^電話號碼為 10 碼！！"
            }
        },
        Email: {
            presence: {
                message: "^Email 為必填欄位！！"
            },
            email: {
                message: "^請填寫正確的 Email 格式！！"
            }
        },
        Address: {
            presence: {
                message: "^寄送地址 為必填欄位！！"
            }
        }
    };
    let errors = validate(orderInfoForm, constraints);
    return errors;
};  

// 送出預訂表單
function submitForm(e) {
    e.preventDefault();

    if (cartsList.carts.length <= 0){
        alert("目前購物車為空！！")
        return;
    };

    orderInfoMessage.forEach(msg =>{
        console.log(msg);
        msg.textContent = "";
    });

    let errors = showErrorMessage();
    if (!validate.isEmpty(errors)){
        /*orderInfoInputs.forEach(input =>{
            console.log(input.name);
            if (input){
                input.nextElementSibling.innerHTML = errors[input.name];
            };
        });*/
        Object.keys(errors).forEach(keys =>{
            console.log(errors[keys]);
            document.querySelector(`.${keys}`).textContent = errors[keys];
        });
        return;
    };
    axiosPostOrders();
};

// 初始化畫面
function _init_() {
    axiosGetProducts();
    axiosGetCarts();
};

_init_();
