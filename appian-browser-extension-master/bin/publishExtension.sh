#!/bin/sh

# Setup
clustername=infra.prod.us-east-1
chrome_extension_id=cjbpgjljaafgoaoccedfbmjkfloejdjf
firefox_extension_id=browserextension@appian.com

# Get token
sa_token=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)

# log in to vault API
vault_login_response=$(curl -s -XPOST "https://vault.eng.appianci.net/v1/auth/$clustername.k8s/login" \
  -d '{"role": "browser-extensions", "jwt":"'$sa_token'"}')
  
vault_token=$(node -e " \
    const vaultToken = $vault_login_response; \
    console.log(vaultToken.auth.client_token); \
  ")

# get the secret
secret_output=$(mktemp)
curl -s -H "X-Vault-Token: $vault_token" \
  "https://vault.eng.appianci.net/v1/secret/projects/browser-extensions/prod/creds" \
  > $secret_output

# parse the secret
eval $(node -e " \
  const secrets = JSON.parse(require('fs').readFileSync('$secret_output', 'UTF8')).data; \
  console.log('export CLIENT_ID='+secrets['chrome-webstore-client-id']+'\nCLIENT_SECRET='+secrets['chrome-webstore-client-secret']+'\nREFRESH_TOKEN='+secrets['chrome-webstore-refresh-token']+'\nWEB_EXT_API_KEY='+secrets['firefox-ext-api-key']+'\nWEB_EXT_API_SECRET='+secrets['firefox-ext-api-secret'])")

# Publish to Chrome WebStore
npx webstore upload --auto-publish --source ./publish/AppianBrowserExtension.zip --extension-id $chrome_extension_id

# Publish to Firefox
npx web-ext-submit --id $firefox_extension_id
