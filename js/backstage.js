// 定義元素選擇器的變數
const orderPageTable = document.querySelector(".orderPage-table");
const orderPageList = document.querySelector(".orderPage-list");

// 定義重複 API 的變數
const baseURL = "https://livejs-api.hexschool.io";
//const api_Customer = "/api/livejs/v1/customer/";
const api_Admin = "/api/livejs/v1/admin/";
const apiPath = "jimmycai";
const UID = {
    headers: {
      Authorization: "H76IdMGuKPV4HJyRdsCCJGRefLq1"
    }
};

let ordersList = [];

// 事件監聽
orderPageList.addEventListener('click', e =>{
    e.preventDefault();
    //console.log(e.target.parentNode.parentNode.id);
    if (e.target.className === "orderPage-status"){
        axiosPutOrders(e.target.parentNode.parentNode.id);
    };
    if (e.target.className === "delSingleOrder-Btn"){
        axiosDeleteOrders(e.target.parentNode.parentNode.id);
    };
    if (e.target.className === "discardAllBtn"){
        axiosDeleteOrders("");
    };
});

// GET 訂單資料 API
function axiosGetOrders() {
    axios.get(`${baseURL}${api_Admin}${apiPath}/orders`, UID).then(data =>{
        console.log(data);
        ordersList = data.data.orders;
        //console.log(ordersList);
        refreshOrders();
        renderC3();
    }).catch(error =>{
        console.log(error);
    });
};

// PUT 訂單資料 API
function axiosPutOrders(id) {
    let paidOrder;
    let statusOrder = {};
    
    ordersList.forEach(item =>{
        if (item.id === id){
            paidOrder = item.paid;
        };
    });
    
    statusOrder["data"] = {
        "id": id,
        "paid": !paidOrder
    };

    axios.put(`${baseURL}${api_Admin}${apiPath}/orders`, statusOrder, UID).then(res =>{
        console.log(res);
        ordersList = res.data.orders;
        //console.log(ordersList);
        refreshOrders();
        renderC3();
    }).catch(error =>{
        console.log(error);
    });    
};

// DELETE 訂單資料 API
function axiosDeleteOrders(id) {
    axios.delete(`${baseURL}${api_Admin}${apiPath}/orders/${id}`, UID).then(res =>{
        console.log(res);
        ordersList = res.data.orders;
        //console.log(ordersList);
        refreshOrders();
        renderC3();
    }).catch(error =>{
        console.log(error);
    });
};

function refreshOrders() {
    let showOrders = ordersList;
    let ordersInfor =
    `
        <thead style="background-color: #A6A6A6">
            <tr>
                <th>訂單編號</th>
                <th>聯絡人</th>
                <th>聯絡地址</th>
                <th>電子郵件</th>
                <th>訂單品項</th>
                <th>訂單日期</th>
                <th>訂單狀態</th>
                <th>操作</th>
            </tr>
        </thead>
    ` ;
    let orderDate = new Date();

    if (showOrders.length > 0){
        
        showOrders.forEach(item =>{
            let showOrders_products = item.products;
            let showOrders_user = item.user;
            let productsTitleArray = [];

            showOrders_products.forEach(item_p =>{
                productsTitleArray.push(item_p.title);
            });
            ordersInfor += 
            `
                <tr id=${item.id}>
                    <td>${item.createdAt}</td>
                    <td>
                    <p>${showOrders_user.name}</p>
                    <p>${showOrders_user.tel}</p>
                    </td>
                    <td>${showOrders_user.address}</td>
                    <td>${showOrders_user.email}</td>
                    <td>
                    <p>${productsTitleArray.join()}</p>
                    </td>
                    <td>${orderDate.getFullYear()}/${orderDate.getMonth()+1}/${orderDate.getDate()}</td>
                    <td class="orderStatus">
                    <a href="#" class="orderPage-status">${item.paid ? "已處理" : "未處理"}</a>
                    </td>
                    <td>
                    <input type="button" class="delSingleOrder-Btn" value="刪除">
                    </td>
                </tr>
                `
        });

        orderPageTable.innerHTML = ordersInfor; 
    }else {
        orderPageTable.innerHTML = ordersInfor; 
    };
};

// 重整載入 C3 圖表
function renderC3() {
    // 資料整理 (全產品類別營收比重)
    let categoryObj = {};
    ordersList.forEach(item =>{
        //console.log(item);
        item.products.forEach(i =>{
            //console.log(i);
            if (categoryObj[i.category] === undefined){
                categoryObj[i.category] = 1;
            }else {
                categoryObj[i.category] += 1;
            };
        });
    });
    // 利用上方新增的 categoryObj 物件，整理成 C3.js 需要的資料格式
    let categoryColumnsArray = [];
    let categoryObjKey = Object.keys(categoryObj);

    categoryObjKey.forEach(item =>{
        categoryColumnsArray.push([item, categoryObj[item]]);
        console.log(categoryColumnsArray);
    });

    // 資料整理 (全品項營收比重)
    //let revenueObj = {};
    let revenueArray_title = [];
    let revenueArray = [];
    ordersList.forEach(item =>{
        //console.log(item);
        item.products.forEach(i =>{
            console.log(i);
            if (!revenueArray_title.includes(i.title)){
                //revenueObj.title = i.title;
                //revenueObj.quantity = i.quantity;
                //console.log(revenueObj);
                revenueArray_title.push(i.title);
                revenueArray.push({title: i.title, quantity: i.quantity});
                //revenueArray.push(revenueObj);
            }else {
                revenueArray[revenueArray_title.indexOf(i.title)]["quantity"] += i.quantity;
            };
        });
    });
    //console.log(revenueArray);
    // 利用上方新增的 revenueArray 陣列，整理成 C3.js 需要的資料格式
    let revenueColumnsArray = [];
    //let revenueObjKey = Object.keys(revenueObj);

    // 排序由大到小
    revenueArray.sort(function(a, b){
        console.log(a,b);
        return b.quantity - a.quantity;
    });
    
    // 篩選出前三名營收品項，其他 4~8 名都統整為「其它」
    let othersQuantity = 0;
    revenueArray.forEach((item, i) =>{
        if (i < 3){
            revenueColumnsArray.push([item.title, item.quantity]);
            console.log(revenueColumnsArray);
        }else {
            othersQuantity += item.quantity;
        };
    });
    revenueColumnsArray.push(["其它", othersQuantity]);


    // 圖表描繪設定
    const categoryChart = c3.generate({
        bindto: "#categoryChart",
        data:{
            type: "pie",
            columns: categoryColumnsArray,
            colors:{
                "床架": "#FF5F5F",
                "收納": "#FFC14F",
                "窗簾": "#00F500"
            }
        },
        size: {
            width: 350,
            height: 350
        }
    });

    const revenueChart = c3.generate({
        bindto: "#revenueChart",
        data:{
            type: "pie",
            columns: revenueColumnsArray,
            colors:{
                "Antony 雙人床架／雙人加大": "#0000A3",
                "Charles 雙人床架": "#0000D1",
                "Louvre 單人床架": "#4F4FFF",
                "Louvre 雙人床架／雙人加大": "#4A0080",
                "Jordan 雙人床架／雙人加大": "#7900D1",
                "Charles 系列儲物組合": "#B959FF",
                "Antony 床邊桌": "#800080",
                "Antony 遮光窗簾": "#D100D1",
                "其它": "#FF59FF"
            }
        },
        size: {
            width: 350,
            height: 350
        }
    });
};

// 初始化畫面
function _init_() {
    axiosGetOrders();
    //renderC3();
};

_init_();