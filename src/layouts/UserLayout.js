import { connect } from 'dva';
import React from 'react';
import { Link } from 'dva/router';
import { Icon } from 'antd';
import { DefaultFooter } from '@ant-design/pro-layout';
import globalUtil from '../utils/global';
import oauthUtil from '../utils/oauth';
import rainbondUtil from '../utils/rainbond';
import logo from '../../public/logo.png';
import cloud from '../../public/cloud.png';
import styles from './UserLayout.less';

class UserLayout extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isRender: false
    };
  }
  componentWillMount() {
    const { dispatch } = this.props;
    // 初始化 获取RainbondInfo信息
    dispatch({
      type: 'global/fetchRainbondInfo',
      callback: (info) => {
        if (info) {
          globalUtil.putLog(info);
          // check auto login
          const isOauth =
            rainbondUtil.OauthbEnable(info) ||
            rainbondUtil.OauthEnterpriseEnable(info);
          let oauthInfo =
            info.enterprise_center_oauth && info.enterprise_center_oauth.value;
          if (!oauthInfo && info.oauth_services && info.oauth_services.value) {
            info.oauth_services.value.map((item) => {
              if (item.is_auto_login) {
                oauthInfo = item;
              }
              return null;
            });
          }
          if (isOauth && oauthInfo) {
            if (oauthInfo.is_auto_login) {
              globalUtil.removeCookie();
              window.location.href = oauthUtil.getAuthredictURL(oauthInfo);
            }
            this.isRender(!oauthInfo.is_auto_login);
          } else {
            this.isRender(true);
          }
        }
      }
    });
  }
  isRender = (isRender) => {
    this.setState({
      isRender
    });
  };
  render() {
    const { rainbondInfo, nouse, children } = this.props;
    const { isRender } = this.state;
    const fetchLogo = rainbondUtil.fetchLogo(rainbondInfo) || logo;
    const isEnterpriseEdition = rainbondUtil.isEnterpriseEdition(rainbondInfo);
    if (!rainbondInfo || !isRender) {
      return null;
    }
    return (
      <div className={styles.container}>
        <div className={styles.headers}>
          <div className={styles.logo}>
            <img src={fetchLogo} alt="LOGO" />
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.contentBox}>
            <div className={styles.contentBoxLeft}>
              <img src={cloud} alt="云原生" />
            </div>
            <div className={styles.contentBoxRight}>{children}</div>
          </div>
        </div>
        {!isEnterpriseEdition && (
          <div className={styles.footers}>
            <DefaultFooter
              copyright="2020 北京好雨科技有限公司出品"
              links={[
                {
                  key: 'Rainbond',
                  title: 'Rainbond',
                  href: 'https://www.rainbond.com',
                  blankTarget: true
                },
                {
                  key: 'poc',
                  title: '申请POC',
                  href: 'https://goodrain.goodrain.com/page/price#customForm',
                  blankTarget: true
                },
                {
                  key: 'community',
                  title: '社区讨论',
                  href: 'https://t.goodrain.com',
                  blankTarget: true
                },
                {
                  key: 'github',
                  title: <Icon type="github" />,
                  href: 'https://github.com/goodrain/rainbond',
                  blankTarget: true
                }
              ]}
            />
          </div>
        )}
      </div>
    );
  }
}

export default connect(({ global }) => ({
  rainbondInfo: global.rainbondInfo,
  nouse: global.nouse
}))(UserLayout);
