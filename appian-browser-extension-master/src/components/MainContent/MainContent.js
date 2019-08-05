/* eslint jsx-a11y/iframe-has-title: 0 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ActionsList from '../ActionsList/ActionsList';
import TabBar from '../TabBar/TabBar';
import Setup from '../Setup/Setup';
import './MainContent.css';
import { settingsUpdate } from '../../model/settingsActions';

export class MainContent extends PureComponent {
  static propTypes = {
    updateSettings: PropTypes.func.isRequired,
    activeView: PropTypes.string,
    actionComplete: PropTypes.bool,
    siteValidationError: PropTypes.string,
    siteUrl: PropTypes.string
  };

  handleViewChange = activeView => {
    this.props.updateSettings({ activeView });
  };

  refAnimationDiv(animationDiv) {
    if (animationDiv) {
      animationDiv.addEventListener('animationend', _ => {
        window.close();
      });
    }
  }

  render() {
    const {
      actionComplete,
      activeView = 'tasks',
      siteValidationError,
      userClickedSetup,
      siteUrl
    } = this.props;
    const showSetup = userClickedSetup || siteValidationError || !siteUrl;
    const viewToShow = showSetup ? 'setup' : activeView;
    const sentTaskOverlayClassNames = `sentTaskOverlay ${
      actionComplete ? 'show' : ''
    }`;

    return (
      <div className="MainContent">
        <div className={sentTaskOverlayClassNames}>
          <div ref={this.refAnimationDiv}>☑</div>
        </div>
        <div className="box info">
          <TabBar
            activeTab={viewToShow}
            handleTabChange={this.handleViewChange}
          >
            {this.renderContent(viewToShow)}
          </TabBar>
        </div>
      </div>
    );
  }

  renderContent = activeView => {
    switch (activeView) {
      case 'actions':
        return <ActionsList />;
      case 'setup':
        return <Setup />;
      default:
        // eslint-disable-next-line no-console
        console.error('Invalid view: ', activeView);
        return null;
    }
  };
}

const mapStateToProps = state => {
  const {
    appian: { actionComplete },
    settings: { activeView, siteUrl, siteValidationError, userClickedSetup }
  } = state;
  return {
    actionComplete,
    activeView,
    siteUrl,
    siteValidationError,
    userClickedSetup
  };
};

const mapDispatchToProps = {
  updateSettings: settingsUpdate
};

export default connect(mapStateToProps, mapDispatchToProps)(MainContent);
