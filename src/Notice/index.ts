import {Notification} from '@douyinfe/semi-ui';
import { NoticePosition } from '@douyinfe/semi-foundation/lib/es/notification/notificationFoundation';

interface NoticeOptions {
  title?: string;
  message: string;
  position?: NoticePosition;
}

const opts = {
  duration: 3,
};

const success = (options: NoticeOptions) => {
  const {title, message, position = 'topRight'} = options;
  Notification.success({
    ...opts,
    title: title,
    content: message,
    position: position
  });
}

const warn = (options: NoticeOptions) => {
  const {title, message, position = 'topRight'} = options;
  Notification.warning({
    ...opts,
    title: title,
    content: message,
    position: position
  });
}

const error = (options: NoticeOptions) => {
  const {title, message, position = 'topRight'} = options;
  Notification.error({
    ...opts,
    title: title,
    content: message,
    position: position
  });
}

const info = (options: NoticeOptions) => {
  const {title, message, position = 'topRight'} = options;
  Notification.info({
    ...opts,
    title: title,
    content: message,
    position: position
  });
}

export {success, warn, error, info};