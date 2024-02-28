import React from 'react';
import { colorToCss } from './Game';
import { setCordenadas } from './Game';

class Square extends React.Component {
    render() {
        return (
            <button className='gameButtons'
                style={{ backgroundColor: colorToCss(this.props.value)}} 
                onClick={() => setCordenadas(this.props.x,this.props.y)} 
            />
        );
    }
}

export default Square;