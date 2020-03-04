import React from 'react';
import { connect } from 'react-redux';
import Money from '../general/money';

class GuestOrderDetailsRow extends React.Component {

    render () {
        const { product, each, quantity, total } = this.props;
    
        return (
            <tr className="">
                <td><img className='guest-detail-thumbnail' src={product.thumbnail.url}></img></td>
                <td>{product.name}</td>
                <td><Money pennies={each}/></td>
                <td>{quantity}</td>
                <td><Money pennies={total}/></td>
            </tr>
        );
    }

}

function mapStateToProps(state){
    return {

    }
}

export default connect(mapStateToProps)(GuestOrderDetailsRow);