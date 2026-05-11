import React from 'react';
import './index.less';
declare const _default: {
    info: (content: React.ReactNode, duration?: number, onClose?: () => void) => {
        key: string;
        destroy: () => void;
    };
    success: (content: React.ReactNode, duration?: number, onClose?: () => void) => {
        key: string;
        destroy: () => void;
    };
    error: (content: React.ReactNode, duration?: number, onClose?: () => void) => {
        key: string;
        destroy: () => void;
    };
    warning: (content: React.ReactNode, duration?: number, onClose?: () => void) => {
        key: string;
        destroy: () => void;
    };
    destroy: (key?: string) => void;
    destroyAll: () => void;
};
export default _default;
