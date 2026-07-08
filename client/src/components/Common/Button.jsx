import React from 'react';
import styled from 'styled-components';

const Button = ({ children, onClick, type = "button", className = "", disabled = false, ...props }) => {
  return (
    <StyledWrapper className={className}>
      <button 
        className="button2" 
        onClick={onClick} 
        type={type} 
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: inline-block;
  width: 100%;
  
  .button2 {
    display: inline-block;
    transition: all 0.2s ease-in;
    position: relative;
    overflow: hidden;
    z-index: 1;
    color: #fcdb32; /* brightsun */
    padding: 0.7em 1.7em;
    cursor: pointer;
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-radius: 0.75em;
    background: #141d38; /* bigstone */
    border: 1px solid #141d38; /* bigstone */
    box-shadow: 0 4px 12px rgba(20, 29, 56, 0.15);
    width: 100%;
    text-align: center;
  }

  .button2:active {
    color: rgba(20, 29, 56, 0.8);
    box-shadow: inset 4px 4px 8px rgba(20, 29, 56, 0.4);
  }

  .button2:before {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(-50%) scaleY(1) scaleX(1.25);
    top: 100%;
    width: 140%;
    height: 180%;
    background-color: rgba(252, 219, 50, 0.1); /* brightsun tint */
    border-radius: 50%;
    display: block;
    transition: all 0.5s 0.1s cubic-bezier(0.55, 0, 0.1, 1);
    z-index: -1;
  }

  .button2:after {
    content: "";
    position: absolute;
    left: 55%;
    transform: translateX(-50%) scaleY(1) scaleX(1.45);
    top: 180%;
    width: 160%;
    height: 190%;
    background-color: #fcdb32; /* brightsun */
    border-radius: 50%;
    display: block;
    transition: all 0.5s 0.1s cubic-bezier(0.55, 0, 0.1, 1);
    z-index: -1;
  }

  .button2:hover {
    color: #141d38; /* bigstone */
    border: 1px solid #fcdb32; /* brightsun */
  }

  .button2:hover:before {
    top: -35%;
    background-color: #fcdb32; /* brightsun */
    transform: translateX(-50%) scaleY(1.3) scaleX(0.8);
  }

  .button2:hover:after {
    top: -45%;
    background-color: #fcdb32; /* brightsun */
    transform: translateX(-50%) scaleY(1.3) scaleX(0.8);
  }

  .button2:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    box-shadow: none;
  }
`;

export default Button;