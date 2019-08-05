import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import './EmbeddedAction.css';
import { appianActionComplete } from '../../model/appianActions';
import { getEmbeddedIframeUrl } from '../../api/appianApi';
import { pageview } from '../../api/extensionTelemetry';

class EmbeddedAction extends PureComponent {
  static propTypes = {
    actionId: PropTypes.string.isRequired,
    currentTabUrl: PropTypes.string,
    currentTabTitle: PropTypes.string,
    emailSubject: PropTypes.string,
    appianActionComplete: PropTypes.func.isRequired,
    isTask: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    const actionId = this.props.actionId || 'default';
    pageview({
      path: `/App/EmbeddedAction/${actionId}`,
      title: `Embedded Action ${actionId}`
    });

    window.addEventListener('message', this.handleIframeMessage, true);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleIframeMessage);
  }

  handleIframeMessage = event => {
    if (event.data === 'form-submitted') {
      this.props.appianActionComplete();
    } else if (event.data === 'form-cancelled') {
      window.close();
    } else {
      const parsedInitializeRequest = /request-magic-menu-initialize(?:\?(.+))?/.exec(
        event.data
      );
      if (parsedInitializeRequest) {
        // The hosted frame is requesting the task properties.
        const childWindow = event.source;
        const suggestions = this.getSuggestedStrings();
        const settings = {
          v1: {
            suggestions
          }
        };
        childWindow.postMessage(
          'initialize-magic-menu?' + JSON.stringify(settings),
          '*'
        );
      } else {
        const parsedResizeEvent = /embed-resize: (.+) x (.+)/.exec(event.data);
        if (parsedResizeEvent) {
          // First parsed param is width, second is height
          // const width = Number(parsedResizeEvent[1]);
          const height = Number(parsedResizeEvent[2]);
          if (height) {
            // We have received a non-zero height from the iframe, we are done loading
            this.setState({ loading: false });
          }
        }
      }
    }
  };

  getSuggestedStrings() {
    const { emailSubject, currentTabTitle, currentTabUrl } = this.props;
    const suggestions = [
      {
        name: 'Email Subject',
        value: emailSubject
      },
      {
        name: 'Tab Title',
        value: currentTabTitle
      },
      {
        name: 'Tab URL',
        value: currentTabUrl
      }
    ].filter(suggestion => suggestion.value);

    return suggestions;
  }

  render() {
    const { actionId, isTask } = this.props;
    const { loading } = this.state;
    const frameContentClassNames = `frame-content ${loading ? 'loading' : ''}`;
    return (
      <div className="formBody">
        <iframe
          title="embeddedAction"
          className={frameContentClassNames}
          src={getEmbeddedIframeUrl(actionId, isTask)}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { settings: { currentTabUrl, currentTabTitle, emailSubject } } = state;
  return {
    currentTabUrl,
    currentTabTitle,
    emailSubject
  };
};

const mapDispatchToProps = {
  appianActionComplete
};

export default connect(mapStateToProps, mapDispatchToProps)(EmbeddedAction);
