import React from 'react';
import './home.scss';
import Dotsbox2 from './dots-box2';
import Cupcakes from './cupcakes';

export default props => {
    return (
        <div className='outer'>
        <div className='main'>
            <h1>We cherish the sweet moments...
    </h1>
    <p>our daily grind and our delight in having tasty treats.
    </p>
    <p>We have been baking gourmet cupcakes, 100% from scratch, from the very first day. We only use the finest of natural ingredients available.</p>
    <h1>Happiness in one bite!</h1>
    <p>We provide services for Weddings, Bar &amp; Bat Mitvahs, Birthdays, Showers, Corporate Events, and any other special occasion!</p>
    <p>Our expert bakers are waiting to make memorable, unique cupcake creations; bursting with freshness and flavor just for you!</p>
    <p>Their delicious taste, great variety and fine flavors will delight you! The best choice for a chic dessert! How can you possibly resist?</p>
    
        </div>
        <Dotsbox2 />
        <div className='note'><h2>Please note you will be overwhelemed by the sweet content</h2></div>
        <Cupcakes/>
        </div>
    );
}