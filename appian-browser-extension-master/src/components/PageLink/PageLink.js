/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { openTab } from '../../api/chromeApi';
import genericIcon from '../../img/generic-icon.png';
import recordIcon from '../../img/record-icon.png';
import reportIcon from '../../img/report-icon.png';
import actionIcon from '../../img/action-icon.png';
import designerIcon from '../../img/designer-icon.png';
import processIcon from '../../img/process-icon.png';
import sitesIcon from '../../img/sites-icon.png';
import {
  settingsRemoveFromFavorites,
  settingsAddToFavorites
} from '../../model/settingsActions';

import './PageLink.css';

class PageLink extends PureComponent {
  static propTypes = {
    page: PropTypes.shape({
      url: PropTypes.string,
      title: PropTypes.string,
      visitCount: PropTypes.number
    }).isRequired,
    addToFavorites: PropTypes.func,
    removeFromFavorites: PropTypes.func,
    favorites: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string,
        title: PropTypes.string
      })
    ).isRequired,
    allowAdd: PropTypes.bool,
    allowRemove: PropTypes.bool
  };

  getIconForUrl(url = '') {
    if (url.indexOf('/records/') >= 0) {
      return recordIcon;
    } else if (url.indexOf('/reports/') >= 0) {
      return reportIcon;
    } else if (url.indexOf('/actions/') >= 0) {
      return actionIcon;
    } else if (url.indexOf('/design/') >= 0 || url.endsWith('/design')) {
      return designerIcon;
    } else if (url.indexOf('/process/') >= 0) {
      return processIcon;
    } else if (url.indexOf('/sites/') >= 0) {
      return sitesIcon;
    } else {
      return genericIcon;
    }
  }

  render() {
    const { page, favorites, addToFavorites, removeFromFavorites } = this.props;

    const alreadyFavorite = favorites.some(
      favorite => favorite.url === page.url
    );

    const visitsTextForPage = page => {
      if (page && page.visitCount) {
        return ` (${page.visitCount} ${
          page.visitCount === 1 ? 'visit' : 'visits'
        })`;
      } else {
        return null;
      }
    };

    const renderFavoriteButton = () => {
      const { allowAdd, allowRemove, page } = this.props;
      if (allowAdd) {
        return (
          <button
            className="btn inner_button flex_item minimize"
            onClick={() => addToFavorites(page)}
            disabled={alreadyFavorite}
            title={
              alreadyFavorite ? 'Already a Favorite' : 'Add Page to Favorites'
            }
          >
            +♥
          </button>
        );
      } else if (allowRemove) {
        return (
          <button
            className="btn inner_button flex_item minimize"
            onClick={() => removeFromFavorites(page)}
            disabled={!alreadyFavorite}
            title={alreadyFavorite ? 'Remove from Favorites' : 'Not a Favorite'}
          >
            -♥
          </button>
        );
      } else {
        return null;
      }
    };

    const icon = this.getIconForUrl(page.url);
    return (
      <div className="side_by_side" key={page.id}>
        <div className="flex_item">
          <li>
            <img className="pageLinkIcon" src={icon} alt="icon" />{' '}
            <a onClick={() => openTab(page.url)} href="" title={page.url}>
              {page.title}
            </a>
            {visitsTextForPage(page)}
          </li>
        </div>
        <div className="flex_item" />
        {renderFavoriteButton()}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { settings: { favorites = [] } } = state;
  return {
    favorites
  };
};

const mapDispatchToProps = {
  addToFavorites: settingsAddToFavorites,
  removeFromFavorites: settingsRemoveFromFavorites
};

export default connect(mapStateToProps, mapDispatchToProps)(PageLink);
