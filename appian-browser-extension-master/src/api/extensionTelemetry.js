import ReactGA from 'react-ga';
import { getExtensionManifest } from './chromeApi';

const trackingId = 'UA-118652049-2';
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
