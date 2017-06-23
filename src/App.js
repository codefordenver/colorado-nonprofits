import React, { Component } from 'react';
import { getBaseUrlPath } from './utils';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { data: [] };
  }

  componentDidMount() {
    fetch(`${getBaseUrlPath()}/data/nonprofits.json`)
      .then(res => res.json())
      .then(data => this.setState({ data }));
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Colorado Nonprofits</h2>
        </div>
        <div className="App-intro">
          {this.state.data.map(org => (
            <div className="App-org" key={org.name}>
              <a href={org.url}>
                {org.name}
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default App;
