import React from 'react';
import { connect } from 'react-redux';
import Money from '../general/money';

class CartRow extends React.Component {

    render () {
        const { thumbnail, name, each, quantity, total } = this.props;
        
        return (
            <tr className="">
                <td><img className='cart-thumbnail' src={thumbnail.url}></img></td>
                <td>{ name } </td>
                <td><Money pennies={each}/></td>
                <td>{ quantity }</td>
                <td><Money pennies={total}/></td>
            </tr>
        );
    }

}

function mapStateToProps(state){
    return {

    }
}

export default connect(mapStateToProps)(CartRow);