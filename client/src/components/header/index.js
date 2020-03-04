import React from 'react';
import './header.scss';
import Nav from '../nav'

export default props => {
    return (
        <div className='header'>
             <div className="top-image"></div>
        <Nav />
        
        <div className="logo"></div>
            <h1 className='mission_statement'>We deliver cupcakes for the important events in your life!</h1>

        </div>
    );
}