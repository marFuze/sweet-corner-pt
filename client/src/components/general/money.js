import React from 'react';

export default props => {
    //console.log('money props:', props)
    const moneyFormat = (props.pennies/100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });
    return (
        <p>{moneyFormat}</p>
        )
}