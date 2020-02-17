import React from 'react';

export default props => {

    const { input, id= input.name, label, meta, type = 'text'} = props;
    return (
        <div className="row">
            <div className="">
                <input className={`${input.name}-checkout`} type={type} id={id} {...input}/>
                <label htmlFor={id}>{label}</label>
                <p className=''>{meta.touched && meta.error}</p>
            </div>
        </div>
    );
}