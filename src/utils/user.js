import cookie from './cookie';
import globalUtil from './global';
import teamUtil from './team';
import regionUtil from './region';

const userUtil = {
  isLogin() {
    return !!cookie.get('token');
  },
  getDefaultTeamName(bean) {
    const dTeam = this.getDefaultTeam(bean);
    if (dTeam) {
      return dTeam.team_name;
    }
    return '';
  },
  getDefaultTeam(bean) {
    // 先判断自己的，如果有自己的团队，则返回
    let team = (bean.teams || []).filter(
      team =>
        team.role_name_list.indexOf('owner') > -1 ||
        bean.user_id === team.creater
    )[0];
    // 也有可能他没有自己的团队，比如移交给别人了
    if (!team) {
      team = bean.teams[0];
    }
    return team;
  },
  getDefaultRegionName(bean) {
    const dTeam = this.getDefaultTeam(bean);
    if (dTeam && dTeam.region.length) {
      return dTeam.region[0].team_region_name;
    }
    return '';
  },
  getTeamByTeamName(user, currTeamName) {
    const currTeam =
      user && user.teams.filter(item => item.team_name === currTeamName)[0];
    return currTeam;
  },
  getTeamByTeamPermissions(teams, currTeamName) {
    const currTeamPermissions =
      teams && teams.filter(item => item.team_name === currTeamName);
    if (currTeamPermissions && currTeamPermissions.length > 0) {
      return currTeamPermissions[0].tenant_actions;
    }
    return currTeamPermissions;
  },
  // 用户是否在某个团队下，拥有某个集群
  hasTeamAndRegion(user, team_name, region_name) {
    const team = this.getTeamByTeamName(user, team_name);
    if (!team) {
      return false;
    }
    const region = (team.region || []).filter(
      item => item.team_region_name === region_name
    )[0];
    return region;
  },
  // 获取某个团队的默认集群

  // 是否开通了gitlab账号
  hasGitlatAccount(user) {
    return user.git_user_id !== 0;
  },
  // 是否是系统管理员
  isSystemAdmin(userBean) {
    return userBean.is_sys_admin;
  },
  // 是否是企业管理员
  isCompanyAdmin(userBean) {
    return userBean && userBean.is_enterprise_admin;
  },
  // 获取当前的soketUrl
  getCurrRegionSoketUrl(currUser) {
    const currTeam = this.getTeamByTeamName(
      currUser,
      globalUtil.getCurrTeamName()
    );
    const currRegionName = globalUtil.getCurrRegionName();
    if (currTeam) {
      const region = teamUtil.getRegionByName(currTeam, currRegionName);
      if (region) {
        return regionUtil.getEventWebSocketUrl(region);
      }
    }
    return '';
  },
};
export default userUtil;
