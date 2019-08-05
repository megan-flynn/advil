# TODO Browser Extension

A browser extension.

Install from the Chrome web store: [Browser Extension](https://chrome.google.com/webstore/detail/TODO)

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
1.  Select the `build` folder and choose `Select`

Changes you make to the code will be hot-deployed to the build folder.

Changes you make to the Popup or dev tools pane will be use Hot Module Replacement and will not require a refresh.

Changes you make to the contentScript/background page may require a refresh. You can refresh the extension, or use Cmd-R while inspecting the background page code.

Changes to the extension manifest (`manifest.json`) will require an extension refresh.

1.  Go to [chrome://extensions](chrome://extensions)
2.  Click the refresh button (curved arrow) next to the extension.

### Build

`npm run build`

The build command will create an optimized, production-ready build of your extension.

`npm run pack`

The pack command will create a zip file of your build.

## Publishing

Publishing a new version of the extension should be done through the [Gitlab](https://gitlab.com/) pipeline.

1.  Make sure the version number in `manifest.json` has been updated.
1.  Merge the changes to the `master` branch.
1.  If all stages of the pipeline succeed, a manual stage will be available called `deploy`.
1.  Click the play (▶) button on the `deploy` stage to publish the new version of the extension to the Chome Extension store.

The publish step is defined in `package.json` by the script `npm run deploy`. The `deploy` script runs another script, `deploy:chrome`. `deploy:chrome` uses the [Chrome Web Store API](https://developer.chrome.com/webstore/api_index) to programatically upload and publish the new extension zip file.

In order to use the API, it must be enabled in the [Google API developer console](https://console.developers.google.com/apis/dashboard?project=project-id-6773048554845498119). This is also where to get credentials needed to use the API.

The credentials are not stored in the `repo` since they are secret. Instead, they are accessed through environment variables. Gitlab provides a way to store [protected environment variables](https://gitlab.com/help/ci/variables/README#variables) to be used by our pipelines. The variables for this project can be found by going to [Settings](https://gitlab.com/) > [CI / CD](https://gitlab.com/) > `Variables`. The variables used by the `deploy` stage are marked as Protected, which means they can only be used by Protected branches (such as `master`).

These variables should only need to be updated if the credentials for the Google API need to be changed. In this case, you can get the values you need from the following locations:

- Google API Console [OAuth Credentials](https://console.developers.google.com/apis/credentials/oauthclient/5456286214-ee7cgt8sk4qdjr103gebjgc8ndhmp3as.apps.googleusercontent.com?project=project-id-6773048554845498119) page (`CLIENT_ID` and `CLIENT_SECRET`)
- [Chrome Webstore API page](https://developer.chrome.com/webstore/using_webstore_api) and follow access token instructions (`REFRESH_TOKEN`)
- [Chrome Webstore Dev Console](https://chrome.google.com/webstore/devconsole/g14560379901919156746/mhiplhbfdjnjmdhfmplmobondgjfdnoe/edit?hl=en_US) for the extension (`EXTENSION_ID`).
