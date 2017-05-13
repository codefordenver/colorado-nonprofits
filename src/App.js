import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { data: [] };
  }

  componentDidMount() {
    fetch('/data/nonprofits.json')
      .then(res => res.json())
      .then(data => this.setState({ data }));
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Colorado Nonprofits</h2>
        </div>
        <div className="App-intro">
          {this.state.data.map(org => (
            <div>
              {org.url}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default App;
