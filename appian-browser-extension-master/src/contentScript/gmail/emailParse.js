export const urlParsers = [
  function(linkElement, siteUrlWithBaseFolder) {
    var match = new RegExp(
      `${siteUrlWithBaseFolder}\\/.*\\/task\\/([0-9]+)\\/?(\\?.*)?$`,
      'g'
    ).exec(linkElement.href);
    return (
      match && {
        tagName: 'appian-task',
        attributes: {
          taskId: match[1]
        },
        linkElement
      }
    );
  },
  function(linkElement, siteUrlWithBaseFolder) {
    var match = new RegExp(
      `${siteUrlWithBaseFolder}\\/.*\\/(reports\\/view|report)\\/([^\\/\\?]+)\\/?(\\?.*)?$`,
      'g'
    ).exec(linkElement.href);
    return (
      match && {
        tagName: 'appian-report',
        attributes: {
          reportUrlStub: match[2]
        },
        linkElement
      }
    );
  }
];

export function isAppianObject(el, siteUrlWithBaseFolder) {
  const isLink = el.tagName && el.tagName.toLowerCase() === 'a';
  if (!isLink) {
    return false;
  }

  const isAppianLink = urlParsers.find(matcher => {
    return matcher(el, siteUrlWithBaseFolder);
  });
  return isAppianLink && isAppianLink(el, siteUrlWithBaseFolder);
}
