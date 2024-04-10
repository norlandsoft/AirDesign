export default (props: IconProps) => {
  return (
    <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path
              d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z"
              stroke={props.color} strokeWidth={props.thickness}></path>
        <path
              d="M11.25 18C11.25 18.4142 11.5858 18.75 12 18.75C12.4142 18.75 12.75 18.4142 12.75 18H11.25ZM18 8L18.5303 8.53033C18.8232 8.23744 18.8232 7.76256 18.5303 7.46967L18 8ZM17.0303 5.96967C16.7374 5.67678 16.2626 5.67678 15.9697 5.96967C15.6768 6.26256 15.6768 6.73744 15.9697 7.03033L17.0303 5.96967ZM15.9697 8.96967C15.6768 9.26256 15.6768 9.73744 15.9697 10.0303C16.2626 10.3232 16.7374 10.3232 17.0303 10.0303L15.9697 8.96967ZM12.75 18V12H11.25V18H12.75ZM16 8.75H18V7.25H16V8.75ZM18.5303 7.46967L17.0303 5.96967L15.9697 7.03033L17.4697 8.53033L18.5303 7.46967ZM17.4697 7.46967L15.9697 8.96967L17.0303 10.0303L18.5303 8.53033L17.4697 7.46967ZM12.75 12C12.75 10.2051 14.2051 8.75 16 8.75V7.25C13.3766 7.25 11.25 9.37665 11.25 12H12.75Z"
              fill={props.color}></path>
        <path
          d="M11.25 18C11.25 18.4142 11.5858 18.75 12 18.75C12.4142 18.75 12.75 18.4142 12.75 18H11.25ZM6 8L5.46967 7.46967C5.17678 7.76256 5.17678 8.23744 5.46967 8.53033L6 8ZM8.03033 7.03033C8.32322 6.73744 8.32322 6.26256 8.03033 5.96967C7.73744 5.67678 7.26256 5.67678 6.96967 5.96967L8.03033 7.03033ZM6.96967 10.0303C7.26256 10.3232 7.73744 10.3232 8.03033 10.0303C8.32322 9.73744 8.32322 9.26256 8.03033 8.96967L6.96967 10.0303ZM12.75 18V12H11.25V18H12.75ZM8 7.25H6V8.75H8V7.25ZM6.53033 8.53033L8.03033 7.03033L6.96967 5.96967L5.46967 7.46967L6.53033 8.53033ZM5.46967 8.53033L6.96967 10.0303L8.03033 8.96967L6.53033 7.46967L5.46967 8.53033ZM12.75 12C12.75 9.37665 10.6234 7.25 8 7.25V8.75C9.79493 8.75 11.25 10.2051 11.25 12H12.75Z"
          fill={props.color}></path>
      </g>
    </svg>
  );
}