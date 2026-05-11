import React from 'react';
interface ToggleButtonProps {
    icon: string;
    size?: number;
    shape: 'circle' | 'square' | 'default';
    selected: boolean;
    onClick: () => void;
    border?: boolean;
    borderColor?: string;
    selectedColor?: string;
    unselectedColor?: string;
}
declare const ToggleButton: React.FC<ToggleButtonProps>;
export default ToggleButton;
