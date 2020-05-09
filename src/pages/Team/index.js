import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { List, Avatar, Button, Icon, notification } from 'antd';
import ConfirmModal from '../../components/ConfirmModal';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './index.less';
import globalUtil from '../../utils/global';
import userUtil from '../../utils/user';
import teamUtil from '../../utils/team';
import cookie from '../../utils/cookie';
import MoveTeam from './move_team';
import TeamDataCenterList from '../../components/Team/TeamDataCenterList';
import TeamMemberList from '../../components/Team/TeamMemberList';
import TeamRoleList from '../../components/Team/TeamRoleList';
import TeamEventList from '../../components/Team/TeamEventList';
import { createEnterprise, createTeam } from '../../utils/breadcrumb';

@connect(({ user, teamControl, loading, enterprise }) => ({
  currUser: user.currentUser,
  teamControl,
  projectLoading: loading.effects['project/fetchNotice'],
  activitiesLoading: loading.effects['activities/fetchList'],
  regions: teamControl.regions,
  currentTeam: teamControl.currentTeam,
  currentRegionName: teamControl.currentRegionName,
  currentEnterprise: enterprise.currentEnterprise,
}))
export default class Index extends PureComponent {
  constructor(arg) {
    super(arg);
    const params = this.getParam();
    this.state = {
      showEditName: false,
      showDelTeam: false,
      showExitTeam: false,
      scope: params.type || 'event',
      teamsUrl: this.props.currentEnterprise
        ? `/enterprise/${this.props.currentEnterprise.enterprise_id}/teams`
        : '/',
    };
  }
  getParam() {
    return this.props.match.params;
  }
  componentDidMount() {
    this.props.dispatch({ type: 'teamControl/fetchAllPerm' });
  }
  componentWillUnmount() {}
  showEditName = () => {
    this.setState({ showEditName: true });
  };
  hideEditName = () => {
    this.setState({ showEditName: false });
  };
  showExitTeam = () => {
    this.setState({ showExitTeam: true });
  };
  hideExitTeam = () => {
    this.setState({ showExitTeam: false });
  };
  handleExitTeam = () => {
    const team_name = globalUtil.getCurrTeamName();
    const { dispatch } = this.props;
    const { teamsUrl } = this.state;
    dispatch({
      type: 'teamControl/exitTeam',
      payload: {
        team_name,
      },
      callback: res => {
        if (res && res._code === 200) {
          dispatch(routerRedux.push(teamsUrl));
        }
      },
    });
  };
  showDelTeam = () => {
    this.setState({ showDelTeam: true });
  };
  hideDelTeam = () => {
    this.setState({ showDelTeam: false });
  };
  handleEditName = data => {
    const team_name = globalUtil.getCurrTeamName();
    this.props.dispatch({
      type: 'teamControl/editTeamAlias',
      payload: {
        team_name,
        ...data,
      },
      callback: () => {
        this.props.dispatch({ type: 'user/fetchCurrent' });
        this.hideEditName();
        this.handleUpDataHeader();
      },
    });
  };
  handleUpDataHeader = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/IsUpDataHeader',
      payload: { isUpData: true },
    });
  };
  handleDelTeam = () => {
    const team_name = globalUtil.getCurrTeamName();
    const { teamsUrl } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'teamControl/delTeam',
      payload: {
        team_name,
      },
      callback: res => {
        if (res && res._code === 200) {
          dispatch(routerRedux.push(teamsUrl));
        }
      },
    });
  };
  handleTabChange = key => {
    this.setState({ scope: key });
  };
  render() {
    const { currUser } = this.props;

    const team_name = globalUtil.getCurrTeamName();
    const team = userUtil.getTeamByTeamName(currUser, team_name);

    const pageHeaderContent = (
      <div className={styles.pageHeaderContent}>
        <div className={styles.avatar}>
          <Avatar
            size="large"
            src={require('../../../public/images/team-icon.png')}
          />
        </div>
        <div className={styles.content}>
          <div className={styles.contentTitle}>
            {team.team_alias}{' '}
            {teamUtil.canEditTeamName(team) && (
              <Icon onClick={this.showEditName} type="edit" />
            )}
          </div>
          <div>
            创建于{' '}
            {moment(team.create_time)
              .locale('zh-cn')
              .format('YYYY-MM-DD')}
          </div>
        </div>
      </div>
    );
    const extraContent = (
      <div className={styles.extraContent}>
        <div className={styles.extraBtns}>
          <Button onClick={this.showExitTeam} type="dashed">
            退出团队
          </Button>
          <Button
            disabled={!teamUtil.canDeleteTeam(team)}
            onClick={this.showDelTeam}
            type="dashed"
          >
            {' '}
            删除团队{' '}
          </Button>
        </div>
      </div>
    );
    const eventCar = <TeamEventList />;
    const tabList = [
      {
        key: 'event',
        tab: '动态',
      },
      {
        key: 'member',
        tab: '成员',
      },
      {
        key: 'datecenter',
        tab: '集群',
      },
      {
        key: 'role',
        tab: '角色',
      },
    ];
    let breadcrumbList = [];
    const { currentEnterprise, currentTeam, currentRegionName } = this.props;
    breadcrumbList = createTeam(
      createEnterprise(breadcrumbList, currentEnterprise),
      currentTeam,
      currentRegionName
    );
    breadcrumbList.push({ title: '团队设置' });
    return (
      <PageHeaderLayout
        breadcrumbList={breadcrumbList}
        tabList={tabList}
        onTabChange={this.handleTabChange}
        content={pageHeaderContent}
        extraContent={extraContent}
      >
        {this.state.scope === 'datecenter' && <TeamDataCenterList />}
        {this.state.scope === 'member' && <TeamMemberList />}
        {this.state.scope === 'role' && <TeamRoleList />}
        {this.state.scope === 'event' && eventCar}

        {this.state.showEditName && (
          <MoveTeam
            teamAlias={team.team_alias}
            onSubmit={this.handleEditName}
            onCancel={this.hideEditName}
          />
        )}
        {this.state.showDelTeam && (
          <ConfirmModal
            onOk={this.handleDelTeam}
            title="删除团队"
            subDesc="此操作不可恢复"
            desc="确定要删除此团队吗？"
            onCancel={this.hideDelTeam}
          />
        )}
        {this.state.showExitTeam && (
          <ConfirmModal
            onOk={this.handleExitTeam}
            title="退出团队"
            subDesc="此操作不可恢复"
            desc="确定要退出此团队吗?"
            onCancel={this.hideExitTeam}
          />
        )}
      </PageHeaderLayout>
    );
  }
}
