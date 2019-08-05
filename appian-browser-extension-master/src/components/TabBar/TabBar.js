import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import actionIcon from '../../img/action-icon.png';
import setupIcon from '../../img/gear-icon.png';
import './TabBar.css';
import { userClickSetup } from '../../model/settingsActions';
import { appianGetTasks } from '../../model/appianActions';

export class TabBar extends PureComponent {
  static propTypes = {
    getTasks: PropTypes.func.isRequired,
    userClickSetup: PropTypes.func.isRequired,
    userClickedSetup: PropTypes.bool,
    activeTab: PropTypes.string.isRequired,
    handleTabChange: PropTypes.func.isRequired,
    backgroundColor: PropTypes.string,
    tasks: PropTypes.array
  };

  componentDidMount() {
    const { getTasks } = this.props;
    getTasks();
  }

  render() {
    const {
      activeTab,
      children,
      handleTabChange,
      userClickSetup,
      userClickedSetup,
      backgroundColor,
      tasks
    } = this.props;
    // The setup tab will be active in two cases:
    // 1) Setup is required (settings are invalid, for example)
    // 2) The user clicked the setup button
    // In the first case, we want to disable all other tabs since
    // the user shouldn't be allowed to leave setup.
    // In the second case it is safe to allow navigation since the
    // user might just decide not to change settings.
    const setupRequired = activeTab === 'setup' && !userClickedSetup;
    return (
      <React.Fragment>
        <div className="tabBar" style={{ backgroundColor }}>
          <button
            className={activeTab === 'actions' ? 'active' : ''}
            onClick={() => handleTabChange('actions')}
            disabled={setupRequired}
          >
            <div>
              <img
                className="buttonIcon makeWhite"
                src={actionIcon}
                alt="Actions"
                height="20"
                width="20"
              />
            </div>
            <div className="buttonLabel">ACTIONS</div>
          </button>
          <button
            className={'endButton ' + (activeTab === 'setup' ? 'active' : '')}
            onClick={!setupRequired ? () => userClickSetup() : undefined}
          >
            <div>
              <img
                className="buttonIcon"
                src={setupIcon}
                alt="Setup"
                height="20"
                width="20"
              />
            </div>
          </button>
        </div>
        <div className="tabContent">{children}</div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const {
    settings: {
      branding: { accentColor: backgroundColor } = {},
      userClickedSetup
    },
    appian: { tasks }
  } = state;
  return {
    userClickedSetup,
    backgroundColor,
    tasks
  };
};

const mapDispatchToProps = {
  userClickSetup,
  getTasks: appianGetTasks
};

export default connect(mapStateToProps, mapDispatchToProps)(TabBar);
