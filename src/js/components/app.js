import React from "react"
import { connect } from 'react-redux';
import AppBar from 'material-ui/AppBar';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import Button from './button';
import * as actions from './../actions/';

class App extends React.Component {
  render () {
    const { projectSettings } = this.props;
    return (<div>
      <AppBar title="Cloud9 Client" showMenuIconButton={false} />
      <List>
        <ListItem 
          primaryText="App config" 
          disabled={true}
          secondaryText={projectSettings.configPath}
        />
        <ListItem 
          primaryText="Node version" 
          disabled={true}
          secondaryText={projectSettings.nodeVersion}
        />
        <ListItem 
          primaryText="Port" 
          disabled={true}
          secondaryText={projectSettings.portNumber}
        />
        <ListItem 
          primaryText="Cloud9" 
          disabled={true}
          secondaryText={projectSettings.cloud9Path} 
          rightIcon={<RaisedButton label="Select" onClick={() => this.props.selectC9ProjectDirectory()} />}
        />
        <ListItem 
          primaryText="Project" 
          disabled={true}
          secondaryText={projectSettings.projectPath} 
          rightIcon={<RaisedButton label="Select" onClick={() => this.props.selectProjectDirectory()} />}
        />
      </List>
      <div style={{textAlign:"center"}}>
        <RaisedButton label="Open" fullWidth={true} onClick={ () => this.props.openProject() }/>
      </div>
    </div>)
  }
}
const mapStateToProps = (state) => state;

export default connect(mapStateToProps, actions)(App);