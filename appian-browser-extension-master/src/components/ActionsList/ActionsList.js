/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import './ActionsList.css';
import EmbeddedAction from '../EmbeddedAction/EmbeddedAction';
import pinIcon from '../../img/pin.png';
import unpinIcon from '../../img/unpin.png';
import starIcon from '../../img/star.png';
// import unstarIcon from '../../img/unstar.png';
import { settingsUpdate } from '../../model/settingsActions';
import { appianGetActions } from '../../model/appianActions';
import { openTab } from '../../api/chromeApi';

export class ActionsList extends PureComponent {
  static propTypes = {
    actions: PropTypes.array,
    pinnedActionId: PropTypes.string,
    onlyShowStarred: PropTypes.bool,
    siteUrl: PropTypes.string.isRequired,
    getActions: PropTypes.func.isRequired,
    disableEmbedded: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: !props.actions,
      currentActionId: this.isPinningEnabled()
        ? this.props.pinnedActionId
        : null
    };
  }

  isPinningEnabled() {
    return !this.props.disableEmbedded;
  }

  isEmbeddedEnabled() {
    return !this.props.disableEmbedded;
  }

  componentDidMount() {
    const { getActions, onlyShowStarred } = this.props;
    getActions(onlyShowStarred, this.isEmbeddedEnabled());
  }

  componentDidUpdate(prevProps, prevState) {
    const { siteUrl, onlyShowStarred, getActions, pinnedActionId } = this.props;
    if (
      siteUrl !== prevProps.siteUrl ||
      onlyShowStarred !== prevProps.onlyShowStarred
    ) {
      getActions(onlyShowStarred, this.isEmbeddedEnabled());
    }

    if (
      this.isPinningEnabled() &&
      pinnedActionId !== prevProps.pinnedActionId &&
      !this.state.currentActionId
    ) {
      this.setState({ currentActionId: pinnedActionId });
    }

    if (prevState.loading && this.props.actions !== prevProps.actions) {
      this.setState({ loading: false });
    }
  }

  showStarred = () => {
    if (this.props.onlyShowStarred) return;
    this.setState({ loading: true });
    this.props.updateSettings({
      onlyShowStarred: true
    });
  };

  showAll = () => {
    if (!this.props.onlyShowStarred) return;
    this.setState({ loading: true });
    this.props.updateSettings({
      onlyShowStarred: false
    });
  };

  showAction = (action, isCmdPressed) => {
    if (this.isEmbeddedEnabled() && !isCmdPressed) {
      const actionId = action.processModelUuid || '';
      this.setState({ currentActionId: actionId });
    } else {
      // Launch in new tab
      const { clickThroughHref } = action;
      if (clickThroughHref) {
        openTab(clickThroughHref);
      }
    }
  };

  pinAction = () => {
    this.props.updateSettings({
      pinnedActionId: this.state.currentActionId
    });
  };

  unpinAction = () => {
    this.props.updateSettings({
      pinnedActionId: null
    });
  };

  clearSelected = () => {
    this.setState({ currentActionId: null });
  };

  renderHeaderArea = (currentActionId, pinnedActionId) => {
    if (currentActionId) {
      return (
        <div className="actionsListHeader">
          <h1 className="actionsListTitle deemphasize">
            <span className="actionsHome" onClick={this.clearSelected}>
              « Back to Actions List
            </span>
          </h1>
          <div className="pinAction">
            {currentActionId === pinnedActionId && (
              <a
                onClick={this.unpinAction}
                title="Stop always loading this action when opening the extension"
              >
                <img src={unpinIcon} alt="unpin icon" />
              </a>
            )}
            {currentActionId !== pinnedActionId && (
              <a
                onClick={this.pinAction}
                title="Always load this action when opening the extension"
              >
                <img src={pinIcon} alt="pin icon" />
              </a>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className="actionsListHeader">
          <h1 className="actionsListTitle">Actions</h1>
          <div className="actionsTypes">
            <a
              onClick={this.showStarred}
              title="Only show starred Actions"
              className={this.props.onlyShowStarred ? 'active' : 'inactive'}
            >
              Starred
            </a>
            &nbsp;|&nbsp;
            <a
              onClick={this.showAll}
              title="Show all Actions"
              className={this.props.onlyShowStarred ? 'inactive' : 'active'}
            >
              All
            </a>
          </div>
        </div>
      );
    }
  };

  renderLoading = () => {
    return (
      <div className="actionListLoading">
        <p>Loading...</p>
      </div>
    );
  };

  renderList = (actions, showStars) => {
    if (!actions) {
      return null;
    }
    if (actions.length === 0) {
      return (
        <div className="actionsItems">
          <p>
            You have not starred any actions. Click{' '}
            <a onClick={this.showAll} title="Show all Actions">
              All
            </a>{' '}
            to see all available actions.
          </p>
        </div>
      );
    }
    function checkAction(action) {
      return action.displayName == 'CI - Create Internal Site';
    }
    let createSiteAction = actions.find(checkAction);
    console.log(createSiteAction);
    //let optionArr = [createSiteAction];
    const actionId = createSiteAction.processModelUuid || '';
    this.setState({ currentActionId: actionId });
    this.renderContent(actionId);
  };

  renderContent = (currentActionId, loading, onlyShowStarred, actions) => {
    /* if currentActionId is not null, then we're showing the EmbeddedAction not the list */
    if (currentActionId) {
      return <EmbeddedAction actionId={currentActionId} />;
    }
    if (loading) {
      return this.renderLoading();
    }
    return this.renderList(actions, !onlyShowStarred);
  };

  render() {
    const { pinnedActionId, onlyShowStarred, actions } = this.props;
    const { loading, currentActionId } = this.state;
    return (
      <div className="actionsList">
        {this.renderHeaderArea(currentActionId, pinnedActionId)}
        {this.renderContent(currentActionId, loading, onlyShowStarred, actions)}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const {
    appian: { actions },
    settings: { siteUrl, pinnedActionId, onlyShowStarred, noCompanionApp }
  } = state;
  return {
    actions,
    siteUrl,
    pinnedActionId,
    onlyShowStarred,
    disableEmbedded: !!noCompanionApp
  };
};

const mapDispatchToProps = {
  updateSettings: settingsUpdate,
  getActions: appianGetActions
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionsList);
