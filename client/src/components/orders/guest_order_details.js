import React from 'react';
import { connect } from 'react-redux';
import { getGuestOrderDetails } from '../../actions';
import { queryToObject } from '../../helpers';
import GuestOrderDetailsRow from './guest_order_details_row';
import './orders.scss';
import Money from '../general/money';


class GuestOrderDetails extends React.Component {

    componentDidMount(){
       
        const orderId = this.props.match.params.order_id;
        const { match, location } = this.props;

        const query = queryToObject(location.search);

        const email = query.email;

        this.props.getGuestOrderDetails(orderId,email);

    }

    render () {

        const { details } = this.props;

        const { items, status, id, createdAt, itemCount, total } = details;
       

        const orderDateTime = new Date(createdAt);
        console.log('orderDateTime', orderDateTime);
        const orderDate = orderDateTime.toLocaleDateString();
        const orderTime = orderDateTime.toLocaleTimeString();

        if(!items){
            return(
                <div className="product-details">
                <h1>Loading Checkout Items</h1>
                </div>
                )
        } else {

        const rowElements = items.map((element) => {
            return <GuestOrderDetailsRow key={element.id} {...element} />
        });
  
        return (
            <div className="guest-order-details-container">
                <h1 className="center">Guest Order Details</h1>
                <h1 className="center">Status: {status}</h1>
                <h3 className="center">Order #: {id}</h3>
                <h5 className="center">** Save order number to check order status in the future **</h5>

                <h4>Order Placed: {`${orderDate} at ${orderTime} (local time)`}</h4>
                <h4>Order Total Items: {itemCount}</h4>
                <h4>Order Total Cost: <Money pennies={total}/></h4>

                <h3>Order Items:</h3>
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
            <tfoot>
            <tr>
                <td></td>
                <td></td>
            <td> <h3>Order Totals:</h3></td>
            <td> <h3>{itemCount}</h3></td>
            <td> <h3><Money pennies={total}/></h3></td>
            </tr>
            </tfoot>

        </table>
           
            
            </div>
        )
    }
}
}

function mapStateToProps(state){
    return {
        details: state.orders.details
    }
}

export default connect(mapStateToProps, {
    getGuestOrderDetails: getGuestOrderDetails
})(GuestOrderDetails);