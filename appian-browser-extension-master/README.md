# Appian Browser Extension

Install from the Chrome web store: [Appian Browser Extension](https://chrome.google.com/webstore/detail/appian-browser-extension/cjbpgjljaafgoaoccedfbmjkfloejdjf)

Documentation can be found on Google Drive at [Appian Browser Extension Info](https://docs.google.com/document/d/1Xp3c6B2919Gxu-Vy1Gd6lbjVtR1ap7QXJnz6WOaEhyo/edit)

## Development

This project uses `npm`.

### Setup

`npm install`

### Run

`npm start`

Starts a development build in watch mode.

To use, install the development extension in your browser.

1.  Go to [chrome://extensions](chrome://extensions)
1.  Choose `Load Unpacked`
1.  Select the `build` folder (e.g. `~/repo/appian-browser-extension/build`) and choose `Select`

Changes you make to the code will be hot-deployed to the build folder.

Changes you make to the React components in the popup will be use Hot Module Replacement and will not require a refresh.

Changes you make to the event/background page may require a refresh. You can refresh the extension, or use Cmd-R while inspecting the background page code.

Changes to the extension manifest (`manifest.json`) will require an extension refresh.

1.  Go to [chrome://extensions](chrome://extensions)
2.  Click the refresh button (curved arrow) next to the extension.

#### Firefox

To test in Firefox, first use the `npm start` command.

Start a new instance of Firefox with the extension loaded by running:

`npm run start:firefox`

This will also watch for file changes and update the extension, but requires the `npm start` server to also be running to update the files in the `build` directory.

### Test

`npm test`

Starts [Jest](https://jestjs.io/) tests.

Tests are run in watch mode by default. As you develop, changes you make to files will cause tests to execute against those changes.

If you have the [Jest extension](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest) for [VSCode](https://code.visualstudio.com/), tests will run in watch mode in the background of your IDE.

### Build

`npm run build`

The build command will create an optimized, production-ready build of your extension.

`npm run pack`

The pack command will create a zip file of your build.

## Publishing

Publishing a new version of the extension should be done through the [Gitlab](https://gitlab.com/appian/dev/appian-browser-extension) pipeline.

1.  Make sure the version number in `manifest.json` has been updated.
1.  Merge the changes to the `master` branch.
1.  If all stages of the pipeline succeed, a manual stage will be available called `deploy`.
1.  Click the play (▶) button on the `deploy` stage to publish the new version of the extension to the Chome Extension store and the Firefox AMO.

The publish step is defined in `package.json` by the script `npm run deploy`. The `deploy` script runs two other scripts, `deploy:chrome` and `deploy:firefox`. `deploy:chrome` uses the [Chrome Web Store API](https://developer.chrome.com/webstore/api_index) to programatically upload and publish the new extension zip file. `deploy:firefox` uses the [web-ext](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/web-ext_command_reference#web-ext_sign) tool to sign and update the extension on the [Firefox Add-on AMO](https://addons.mozilla.org/en-US/firefox/).

In order to use the API, it must be enabled in the [Google API developer console](https://console.developers.google.com/apis/dashboard?project=project-id-6773048554845498119). This is also where to get credentials needed to use the API.

The credentials are not stored in the `repo` since they are secret. Instead, they are accessed through environment variables. Gitlab provides a way to store [protected environment variables](https://gitlab.com/help/ci/variables/README#variables) to be used by our pipelines. The variables for this project can be found by going to [Settings](https://gitlab.com/appian/dev/appian-browser-extension/edit) > [CI / CD](https://gitlab.com/appian/dev/appian-browser-extension/settings/ci_cd) > `Variables`. The variables used by the `deploy` stage are marked as Protected, which means they can only be used by Protected branches (such as `master`).

These variables should only need to be updated if the credentials for the Google API or Firefox API need to be changed. In this case, you can get the values you need from the following locations:

* Google API Console [OAuth Credentials](https://console.developers.google.com/apis/credentials/oauthclient/5456286214-ee7cgt8sk4qdjr103gebjgc8ndhmp3as.apps.googleusercontent.com?project=project-id-6773048554845498119) page (`CLIENT_ID` and `CLIENT_SECRET`)
* [Chrome Webstore API page](https://developer.chrome.com/webstore/using_webstore_api) and follow access token instructions (`REFRESH_TOKEN`)
* [Chrome Webstore Dev Console](https://chrome.google.com/webstore/devconsole/g14560379901919156746/cjbpgjljaafgoaoccedfbmjkfloejdjf/edit?hl=en_US) for the extension (`EXTENSION_ID`).
* [Firefox API Keys on Developer Hub](https://addons.mozilla.org/en-US/developers/addon/api/key/) for the Firefox AMO (`WEB_EXT_API_KEY` and `WEB_EXT_API_SECRET`)
