import './index.less';
import { IconType, NotificationPlacement } from "antd/es/notification/interface";
interface NotificationOptions {
    title?: string;
    message: string;
    type?: IconType;
    duration?: number;
    position?: NotificationPlacement;
}
declare const info: (options: NotificationOptions) => void;
declare const success: (options: NotificationOptions) => void;
declare const warn: (options: NotificationOptions) => void;
declare const error: (options: NotificationOptions) => void;
export { info, success, warn, error };
