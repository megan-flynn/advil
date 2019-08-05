import ReactGA from 'react-ga';
import { getExtensionManifest } from '../api/chromeApi';

const trackingId = 'TODO';
const { name, version } = getExtensionManifest();

export function initializeTelemetry() {
  ReactGA.initialize(trackingId);
  ReactGA.set({
    appName: name,
    appVersion: version,
    checkProtocolTask: null
  });
}

export function pageview({ path, title }) {
  const trackerNames = undefined;
  ReactGA.pageview(path, trackerNames, title);
}

export function event(eventArgs /* category, action, value, label */) {
  ReactGA.event(eventArgs);
}

export function exception(description, fatal = false) {
  ReactGA.exception({ description, fatal });
}
