import React from 'react';

const Button = props => {

    const {
        children
    } = props;

    return (
        <div>
            {children}
        </div>
    );
}

export default Button;