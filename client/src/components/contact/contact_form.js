import React from 'react';
import { Field, reduxForm } from 'redux-form';
import Input from './input';
import './contact.scss';

class ContactForm extends React.Component {
    contactUs(formValues){
        console.log('Form Values:', formValues);
    }

    render(){
        const { handleSubmit } = this.props;
        return (
            <div><h1>Contact Form</h1>

            <form onSubmit={handleSubmit(this.contactUs)}>
                <Field name='name' component={Input} label='Name'/>
                <Field name='email' component={Input} label='Email' type='email'/>
                <Field name='phone' component={Input} label='Phone' type='tel' />
                <Field name='subject' component={Input} label='Subject' type='text'/>
                <Field name='message' component={Input} label='Message' type='text'/>
                    <div className='row'>
                    <button className='send'>Send</button>
                </div>

            </form>
            </div>
        )
    }
}

function validate (formValues){

    const { name, email, phone, subject, message} = formValues;
    const errors = {};
   if (!name){
       errors.name = "Please enter your name."
   }
   
   if (!email){
    errors.email = "Please enter your email."
    }   

    if (!phone){
    errors.phone = "Please enter your phone number."
    }

    if (!subject){
    errors.subject = "Please enter a subject."
    }

    if (!message){
    errors.message = "Please enter a message."
    }
   return errors;
}

export default reduxForm({
    form:'contact-form',
    validate: validate
})(ContactForm);



