export default (props: IconProps) => {
  return (
    <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_iconCarrier">
        <path d="M12 7L12 14M12 14L15 11M12 14L9 11" stroke={props.color} strokeWidth={props.thickness} strokeLinecap="round"
              strokeLinejoin="round"></path>
        <path d="M16 17H12H8" stroke={props.color} strokeWidth={props.thickness} strokeLinecap="round"></path>
        <path
          d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z"
          stroke={props.color} strokeWidth={props.thickness}></path>
      </g>
    </svg>
  );
}