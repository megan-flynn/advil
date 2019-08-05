import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './App.css';
import Spinner from '../Spinner/Spinner';
import MainContent from '../MainContent/MainContent';
import { settingsGet } from '../../model/settingsActions';

export class App extends Component {
  static propTypes = {
    settingsLoaded: PropTypes.bool,
    settingsGet: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.props.settingsGet();
  }

  getComponentToDisplay() {
    const { settingsLoaded } = this.props;
    if (settingsLoaded) {
      return <MainContent />;
    } else {
      return <Spinner />;
    }
  }

  render() {
    return <div className="App">{this.getComponentToDisplay()}</div>;
  }
}

const mapStateToProps = state => {
  const { settings: { settingsLoaded } } = state;
  return {
    settingsLoaded
  };
};

const mapDispatchToProps = {
  settingsGet
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
