import React from 'react';
import { connect } from 'react-redux';
import { getActiveCart } from '../../actions';
import './cart.scss';
import CartRow from './cart-row';
import { Link } from 'react-router-dom';

class Cart extends React.Component {
    

    componentDidMount(){
        this.props.getActiveCart();
    }

    render() {        
        const { cartItems } = this.props;

        const rowElements = cartItems.map((element, index) => {
     
        return <CartRow key={element.itemId} index={index} {...element} />
    });
        return (
            <div className='cart-container'>
             <table className='cart-table'>
            <thead>
                <tr>
                    <th></th>
                    <th>Product</th>
                    <th>Each</th>
                    <th>Quantity</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                {rowElements}
            </tbody>
        </table>
            <button><Link className='link-button-text' to="/checkout/guest">Checkout As Guest</Link></button>
            </div>
        )
    }
}

function mapStateToProps(state){
    
    return {
        cartItems: state.cart.items
    }
}

export default connect(mapStateToProps,{
    getActiveCart: getActiveCart
})(Cart);