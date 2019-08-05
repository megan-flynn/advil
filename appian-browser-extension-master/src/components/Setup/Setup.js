import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import './Setup.css';
import { pageview } from '../../api/extensionTelemetry';
import { settingsUpdate } from '../../model/settingsActions';
import serverIcon from '../../img/server-icon.png';
import Linkify from 'react-linkify';
import { openTab } from '../../api/chromeApi';

export class Setup extends PureComponent {
  static propTypes = {
    updateSettings: PropTypes.func.isRequired,
    siteUrl: PropTypes.string,
    siteValidationWarning: PropTypes.string,
    siteValidationError: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      siteUrl: props.siteUrl || ''
    };
  }

  componentDidMount() {
    pageview({ path: '/App/Setup', title: 'Settings' });
  }

  handleTextChange = event => {
    this.setState({ siteUrl: event.target.value });
  };

  handleEnter = event => {
    if (event.key === 'Enter') {
      this.submitSettings(event);
    }
  };

  submitSettings = event => {
    const { updateSettings } = this.props;
    this.setState({ submitting: true });
    event.preventDefault();
    let siteUrl = this.state.siteUrl || '';
    if (siteUrl.endsWith('/')) {
      siteUrl = siteUrl.substring(0, siteUrl.length - 1);
    }
    if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
      siteUrl = 'https://' + siteUrl;
    }
    updateSettings({ siteUrl: siteUrl });
    this.setState({ submitting: false });
  };

  resetAll = event => {
    const { updateSettings } = this.props;
    this.setState({ siteUrl: '', actionId: '' });
    event.preventDefault();
    updateSettings({ siteUrl: '', actionId: '' });
  };

  render() {
    const { siteValidationError, siteValidationWarning } = this.props;

    const { siteUrl, submitting } = this.state;

    const enableSubmit = siteUrl && !submitting;

    // TODO: a spinner state while waiting for submit to finish
    return (
      <div className="setupWrapper">
        <div className="setupHeader">Setup</div>
        <div className="box_body">
          <div className="side_by_side middle dense">
            <div className="flex_item minimize">
              <div className="label">Server</div>
            </div>
            <div className="flex_item minimize">
              <img
                src={serverIcon}
                alt="server"
                title="Enter the URL to connect to"
                className="setupIcon"
              />
            </div>
            <div className="flex_item">
              <input
                type="text"
                className="text"
                onChange={this.handleTextChange}
                onKeyPress={this.handleEnter}
                placeholder="Example: bpm.example.com"
                value={siteUrl}
              />
            </div>
          </div>
        </div>
        <Linkify properties={{ onClick: e => openTab(e.target.href) }}>
          <div className="text_warning">{siteValidationWarning}</div>
          <div className="text_error">{siteValidationError}</div>
        </Linkify>
        <div className="box_body divider_above">
          <div className="side_by_side middle dense">
            <div className="flex_item" />
            <div className="flex_item minimize">
              <button
                className="btn small primary"
                disabled={!enableSubmit}
                onClick={this.submitSettings}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const {
    settings: { siteUrl, siteValidationWarning, siteValidationError }
  } = state;
  return {
    siteUrl,
    siteValidationWarning,
    siteValidationError
  };
};

const mapDispatchToProps = {
  updateSettings: settingsUpdate
};

export default connect(mapStateToProps, mapDispatchToProps)(Setup);
