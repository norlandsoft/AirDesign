import React from 'react';
import ButtonPage from '@/pages/ButtonPage';
import styles from './BasicLayout.less';

const BasicLayout: React.FC = () => {

  const contentHeight = window.innerHeight - 50;
  const contentWidth = window.innerWidth - 200;

  return (
    <div className={styles.container}>
      <div className={styles.top}>AirDesign</div>
      <div className={styles.left} style={{height: contentHeight}}>MENU</div>
      <div className={styles.content} style={{height: contentHeight, width: contentWidth}}>
        PAGE
      </div>
    </div>
  );
};

export default BasicLayout;