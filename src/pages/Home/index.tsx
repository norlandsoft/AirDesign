import React from 'react';
import {connect} from 'umi';
import {Avatar} from "antd";
import {UserResponse} from '@/types/user';
import './index.less';

interface HomeProps {
  currentUser: UserResponse | null;
  frameSize: any;
}

const Home: React.FC<HomeProps> = props => {

  const {
    currentUser
  } = props;

  return (
      <div className={'air-home-container'}>
        <div className={'air-home-top'}>
          {
              currentUser && (
                  <div className={'air-home-top-user'}>
                    <Avatar size={80} src={`/icons/avatar/${currentUser?.avatar}.svg`}/>
                    <div className={'air-home-top-welcome'}>欢迎, {currentUser?.name}</div>
                  </div>
              )
          }
        </div>
      </div>
  );
};

export default connect(({global, user}) => ({
  frameSize: global.frameSize,
  currentUser: user.currentUser,
}))(Home);
