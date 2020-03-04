import React from 'react';
import './contact.scss';
import ContactForm from './contact_form';
import Schedule from '../general/schedule/index.js'
import UpDots from './up-dots';
import DownDots from './down-dots';

export default props => {
    return (
        <div>
        <div className='contact-form-container'>
            <div className='contact-main'>
                <h1>Contact us today!</h1>
                <p>Talk cupcakes to us! At Sweet Corner's we love hearing from our
                customers. Send your questions, comments and flavor
                suggestions to:</p>
                <a href="office@sweetcorner.com">office@sweetcorner.com</a>
                <p>Our expert bakers are waiting to create an unique cupcake
                bursting with freshness and flavor just for you. Our management
                team are also waiting for their next event to organize.</p>
                <UpDots />
                </div>
                <div className='contact-form'><ContactForm /></div>
        </div>

        <div className='schedule-table-container'>
        <div className='schedule-table'><Schedule /></div> 
        <div className='downDots'><DownDots /></div>
        </div>
        </div>
    );
}