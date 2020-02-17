import React from 'react';
import './footer.scss'

export default props => {

    const year = new Date().getFullYear();

    return (
        <div className='footer'>
            <div className="dots"></div>

            <div><p>&copy;{year} Sweetcorner.com.  All rights reserved.</p></div>

            <div><p><i className="fa fa-phone"></i>800 264 2099</p></div>

        </div>
    );
}