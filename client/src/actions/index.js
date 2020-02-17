import types from './types';
import axios from 'axios';

const BASE_URL = 'http://api.sc.lfzprototypes.com';

export function getScheduleData(){
    return async  function (dispatch) {
        const resp = await axios.get('/data/schedule.json');
        dispatch({
            type: types.GET_SCHEDULE_DATA,
            schedules: resp.data.schedule
        });
    }
}

export function getAllProducts(){
    return async function (dispatch) {
        try {
            const resp = await axios.get('/api/products');
            dispatch({
                type: types.GET_ALL_PRODUCTS,
                products: resp.data.products
            });
        } catch(err) {
            console.log('Error getting all products:', err);
        }
    }
}

export function getProductDetails(productId){
    return async function (dispatch) {
        try {
            const resp = await axios.get(`/api/products/${productId}`);
            dispatch({
                type: types.GET_PRODUCT_DETAILS,
                product: resp.data
            });
        } catch(err) {
            console.log('Error getting product details:', err);
        }
    }
}

export function clearProductDetails(){
        return {
            type: types.CLEAR_PRODUCT_DETAILS
        }
    }

export function addItemToCart(productId, quantity){
    return async function (dispatch) {
        try {
           
            const cartToken = localStorage.getItem('sc-cart-token');

            const axiosConfig = {
                headers: {
                    'x-cart-token': cartToken
                }
            }

            const resp = await axios.post('/api/cart/items/' + productId,{
                quantity: quantity
             },axiosConfig);

             localStorage.setItem('sc-cart-token', resp.data.cartToken);
            
             dispatch({
                type: types.ADD_ITEM_TO_CART,
                cartTotal: resp.data.total
            });

        } catch(err){
            console.log('Error adding item to cart', err);
        } 
    }
}

export function getActiveCart() {
    return async function (dispatch) {
    try {
      
        const cartToken = localStorage.getItem('sc-cart-token');

        const axiosConfig = {
            headers : {
                'X-Cart-Token': cartToken
            }
        }

        const resp = await axios.get(BASE_URL + '/api/cart',axiosConfig
        );

        dispatch({
            type: types.GET_ACTIVE_CART,
            cart: resp.data
        })

    } catch(err) {
        console.log('Error getting active cart', err);
    }
}
}


export function getCartTotals(){
    return async function (dispatch) {
        try {

            const cartToken = localStorage.getItem('sc-cart-token');

            const axiosConfig = {
                headers: {
                    'x-cart-token': cartToken
                }
            }

            const resp = await axios.get(BASE_URL + '/api/cart/totals',axiosConfig);

            dispatch({
                type: types.GET_CART_TOTALS,
                total: resp.data.total
            });

        } catch(err) {
            console.log('Error getting cart totals:', error);
        }
    }
}

export function createGuestOrder(guest){
    return async function (dispatch) {
        try {

            const cartToken = localStorage.getItem('sc-cart-token');

            const axiosConfig = {
                headers: {
                    'x-cart-token': cartToken
                }
            }

            const resp = await axios.post(BASE_URL + '/api/orders/guest', guest, axiosConfig);
            localStorage.removeItem('sc-cart-token');

            dispatch({
                type: types.CREATE_GUEST_ORDER,
                order: {
                    id: resp.data.id, // The order ID from the server goes here
                    message: resp.data.message // The message from the server goes here 
                }
            });

            return {
                email: guest.email,
                orderId: resp.data.id
            };

        } catch(err) {
            console.log('Error creating guest order:', err);
        }
    }
}

export function getGuestOrderDetails(orderId, email){
    return async function (dispatch) {
        try {
    
            const resp = await axios.get(BASE_URL + '/api/orders/guest/' + orderId + '?email=' + email);
            
            dispatch({
                type:types.GET_GUEST_ORDER_DETAILS,
                order: resp.data
            });

        } catch(err) {
            console.log('Error creating guest order:', err);
        }
    }
}