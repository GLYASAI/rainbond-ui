import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { notification } from 'antd';
import PageLoading from '../components/PageLoading';
import Exception from '../pages/Exception/403';
import roleUtil from '../utils/role';
import userUtil from '../utils/user';

class TeamPermissions extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      teamView: true,
      loading: true,
    };
  }
  componentWillMount() {
    this.fetchUserInfo();
  }

  fetchUserInfo = () => {
    const { dispatch, currentUser } = this.props;
    const { teamName } = this.props.match.params;
    if (currentUser && teamName) {
      this.handleResults(currentUser.teams, teamName);
    } else if (teamName) {
      dispatch({
        type: 'user/fetchCurrent',
        callback: res => {
          if (res && res._code === 200) {
            this.handleResults(res.bean.teams, teamName);
          }
        },
        handleError: () => {
          this.setState({
            loading: false,
            teamView: false,
          });
        },
      });
    }
  };

  handleResults = (teams, teamName) => {
    const { dispatch } = this.props;
    const teamPermissions = userUtil.getTeamByTeamPermissions(teams, teamName);
    if (teamPermissions && teamPermissions.length === 0) {
      notification.warning({
        message: '请先加入团队',
      });
      return router.push('/');
    }
    dispatch({
      type: 'teamControl/fetchCurrentTeamPermissions',
      payload: teamPermissions,
    });
    const results = roleUtil.queryTeamUserPermissionsInfo(
      teamPermissions,
      'teamBasicInfo',
      'describe'
    );
    this.setState({ teamView: results, loading: false });
  };

  render() {
    const { children } = this.props;
    const { teamView, loading } = this.state;

    if (loading) {
      return <PageLoading />;
    }
    if (!teamView) {
      return <Exception />;
    }
    return (
      <div>
        <div>{children}</div>
      </div>
    );
  }
}

export default connect(({ user }) => ({
  currentUser: user.currentUser,
}))(TeamPermissions);