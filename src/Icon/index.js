import React from "react";
import {ReactSVG} from "react-svg";

const AirIcon = props => {

  const {
    name,
    size,
    color = '#000000'
  } = props;

  return (
      <div
          style={{
            height: size + 'px',
            width: size + 'px',
            lineHeight: size + 'px',
            overflow: 'hidden',
            userSelect: 'none',
            ...props.style
          }}
      >
        <ReactSVG
            beforeInjection={(svg) => {
              svg.setAttribute('style', `width: ${size}px; height: ${size}px; stroke: ${color};`);
            }}
            src={`/assets/icon/${name}.svg`}
            wrapper='span'
        />
      </div>
  )
}

export default AirIcon;