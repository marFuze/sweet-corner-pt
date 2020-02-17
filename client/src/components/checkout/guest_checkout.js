import React from 'react';
import { Field, reduxForm } from 'redux-form';
import Input from './input';
import './checkout.scss';
import { connect } from 'react-redux';
import { createGuestOrder } from '../../actions';

class GuestCheckout extends React.Component {

    async handleGuestCheckout(formValues){
        const orderInfo = await this.props.createGuestOrder(formValues);
        const url = '/orders/guest/' + orderInfo.orderId + '?email=' + orderInfo.email;
        this.props.history.push(url);
    }

    render () {
        const { handleSubmit } = this.props;
    return (
        <div className="guest-checkout">
        <h1 className="center">Guest Checkout</h1>
        <form onSubmit={handleSubmit(this.handleGuestCheckout.bind(this))}>
        <Field name='firstName' component={Input} label='First Name' />
        <Field name='lastName' component={Input} label='Last Name' />
        <Field name='email' component={Input} label='Email' type='email' />
        <div className="row">
            <button>Submit Order</button>
        </div>
        </form>
        </div>
        );
    }
}

function validate (formValues){

    const { firstName, lastName, email} = formValues;
    const errors = {};
    if (!firstName){
       errors.name = "Please enter your first name."
    }

    if (!lastName){
    errors.name = "Please enter your last name."
    }
   
    if (!email){
    errors.email = "Please enter your email."
    }   

    return errors;
}

GuestCheckout = reduxForm({
    form:'guest-checkout-form',
    validate: validate
})(GuestCheckout);

export default connect(null, {
    createGuestOrder: createGuestOrder
})(GuestCheckout);

