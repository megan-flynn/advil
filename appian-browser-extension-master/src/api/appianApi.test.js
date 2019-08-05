import { _getCurrentSite, _setCurrentSite, _getSiteToken } from './appianApi';

describe('appianApi', () => {
  beforeEach(() => {
    _setCurrentSite({});
  });

  test('Current Site is remembered by appianApi', async () => {
    const testSite = { siteUrl: 'https://test' };
    expect(_getCurrentSite()).toEqual({});
    _setCurrentSite(testSite);
    expect(_getCurrentSite()).toEqual(testSite);
  });

  describe('getSiteToken', () => {
    const testUrl = 'http://getSiteToken.test';
    const testUrl2 = 'http://getSiteToken2.test';
    const testUrlTokenMap = {
      [testUrl]: 'abc',
      [testUrl2]: 'xyz'
    };

    beforeEach(() => {
      global.fetch = jest.fn(
        url =>
          testUrlTokenMap[url.replace('/suite/cors/ping', '')]
            ? new Promise(resolve =>
                resolve({
                  status: 200,
                  ok: true,
                  json: () => ({
                    __appianCsrfToken:
                      testUrlTokenMap[url.replace('/suite/cors/ping', '')]
                  })
                })
              )
            : Promise.resolve({
                status: 404
              })
      );
    });

    test('Will get the token for passed-in site Url', async () => {
      const token = await _getSiteToken(testUrl);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(token).toEqual(testUrlTokenMap[testUrl]);
    });

    test('Throws error for invalid site Url', async () => {
      await expect(_getSiteToken('https://whatever.com')).rejects.toThrowError(
        '404'
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    describe('after it has been called once', () => {
      beforeEach(async () => {
        await _getSiteToken(testUrl);
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      test('Will cache the token for the same site Url', async () => {
        const token2 = await _getSiteToken(testUrl);
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(token2).toEqual(testUrlTokenMap[testUrl]);
      });

      test('Will reuse the same site and token when site parameter is null', async () => {
        const token = await _getSiteToken();
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(token).toEqual(testUrlTokenMap[testUrl]);
      });

      test('Will fetch a new token when the site Url changes', async () => {
        const token = await _getSiteToken(testUrl2);
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(token).toEqual(testUrlTokenMap[testUrl2]);
      });

      test('Will fetch a new token when the site Url was changed before getSiteToken', async () => {
        _setCurrentSite({ siteUrl: testUrl });
        const token = await _getSiteToken();
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(token).toEqual(testUrlTokenMap[testUrl]);
      });
    });
  });
});
