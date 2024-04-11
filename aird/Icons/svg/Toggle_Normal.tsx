export default (props: IconProps) => {
  return (
    <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path id="Vector" d="M12 18V6" stroke={props.color} strokeWidth={props.thickness} strokeLinecap="round"
              strokeLinejoin="round"/>
      </g>
    </svg>
  )
}