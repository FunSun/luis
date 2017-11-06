import * as React from 'react';
import { Menu, Icon, Loader, Dropdown, Popup } from 'semantic-ui-react';
import { inject, observer } from 'mobx-react';
import { style } from 'typestyle';
import { observable } from 'mobx';
import { ErrorView } from './test_view';
import { Test } from '../models/test_model';

const image = process.env.NODE_ENV == 'test' ? 'react.png' : require("./react.png");

export type Props = {
  state: Luis.State;
};

const noMargin = style({
  marginBottom: '0px!important'
});

const menuImage = style({
  width: '18px!important',
  height: '18px',
  margin: '-2px 6px -2px 0px!important'
});

@observer
export class TopPanel extends React.Component<Props> {
  @observable updating = false;

  handleItemClick = (e: React.MouseEvent<any>) => (this.props.state.viewState.snapshotView = e.currentTarget.getAttribute('data-name'));

  updateClick = async (_e: any) => {
    // this.updating = true;
    // const story = this.props.state.viewState.selectedStory;
    // if (story) {
    //   await fetch(`/tests?name=${story.name.replace(/\s/g, '')}&extraParams=${this.props.state.renderOptions.extraUpdateProps}`);
    //   this.updating = false;
    // }

    // we need to do this asynchronously to get around batched updates of React fibers
    setTimeout(() => {
      if (this.props.state.viewState.selectedStory) {
        this.props.state.updatingSnapshots = true;
        this.props.state.testQueue.canAddTest = true;
        this.props.state.testQueue.add(this.props.state.viewState.selectedStory);
      }
    }, 10);
    
  };

  render() {
    const view = this.props.state.viewState.snapshotView;
    const story = this.props.state.viewState.selectedStory || { passingTests: 0, failingTests: 0 };

    return (
      <Menu pointing secondary inverted color="blue" className={noMargin}>
        <Menu.Item title={`${story.passingTests} / ${story.passingTests + story.failingTests} test(s) are passing.`}>
          <Icon name="check" color="green" />
          <div className="lbl">{story.passingTests}</div>
        </Menu.Item>
        <Menu.Item title={`${story.failingTests} / ${story.passingTests + story.failingTests} test(s) are failing.`}>
          <Icon name="remove" color="red" />
          <div className="lbl">{story.failingTests}</div>
        </Menu.Item>
        <Menu.Item data-name="react" active={view === 'react'} onClick={this.handleItemClick} title="View of the React component">
          <img src={image} className={menuImage} /> React1
        </Menu.Item>
        <Menu.Item data-name="html" content="Html" active={view === 'html'} icon="html5" onClick={this.handleItemClick} title="View currently selected snapshot and visualise possible differences with stored snapshot" />
        <Menu.Item data-name="json" content="Json" active={view === 'json'} icon="code" onClick={this.handleItemClick} title="View the source currently selected snapshot and visualise possible differences with stored snapshot" />
        <Menu.Item
          active={view === 'snapshots'}
          onClick={this.handleItemClick}
          title="View all snapshots of a currently selected test or story"
        ><Icon name="image" /></Menu.Item>
        <Menu.Menu position="right">
          {this.updating ? (
            <Menu.Item title="Update test snapshots to reflect current changes and save snapshots on server.">
              <Loader active inline size="mini" />
            </Menu.Item>
          ) : (
            <Menu.Item onClick={this.updateClick}>
              <Icon name="refresh" />
            </Menu.Item>
          )}
          <Menu.Item
            title="Auto-update test snapshots with each hot reload to reflect current changes and save snapshots on server."
            active={this.props.state.autoUpdateSnapshots}
            onClick={() => (this.props.state.autoUpdateSnapshots = !this.props.state.autoUpdateSnapshots)}>
           <Icon name="lock" />
          </Menu.Item>
        </Menu.Menu>
      </Menu>
    );
  }
}

@inject('state')
@observer
export class TopPanelSingle extends React.Component<Props> {
  @observable updating = false;

  handleItemClick = (e: React.MouseEvent<any>) => (this.props.state.viewState.snapshotView = e.currentTarget.getAttribute('data-name'));

  updateClick = async (_e: any) => {
    if (this.props.state.viewState.selectedStory) {
      this.props.state.updatingSnapshots = true;
      this.props.state.testQueue.canAddTest = true;
      this.props.state.testQueue.add(this.props.state.viewState.selectedStory);
    }
  };

  render() {
    const view = this.props.state.viewState.snapshotView;
    const test: Test = this.props.state.viewState.selectedTest;
    const viewState = this.props.state.viewState;

    return (
      <Menu pointing secondary inverted color="blue" className={noMargin}>
        <Menu.Item>
          {test && test.error ? (
            <Popup trigger={<Icon name="remove" color="red" />} wide="very">
              <Popup.Content>
                <ErrorView test={test} />
              </Popup.Content>
            </Popup>
            
          ) : (
            <Icon name="check" color="green" />
          )}
          { test && test.duration ? test.duration : 0 }ms
        </Menu.Item>
        <Menu.Item data-name="react" active={view === 'react'} icon="cube" onClick={this.handleItemClick} />
        <Menu.Item data-name="html" active={view === 'html'} icon="html5" onClick={this.handleItemClick} />
        <Menu.Item data-name="json" active={view === 'json'} icon="code" onClick={this.handleItemClick} />
        {test &&
          test.snapshots && (
            <Dropdown item text={viewState.selectedSnapshot ? viewState.selectedSnapshot.name : 'Select Snapshot'}>
              <Dropdown.Menu>
                {test.snapshots.map((s, i) => (
                  <a
                    href=""
                    key={s.name + i}
                    className="item"
                    onClick={e => {
                      e.preventDefault();
                      viewState.snapshotName = s.url;
                      viewState.snapshotView = 'html';
                    }}
                  >
                    <Icon name="image" /> {s.name}
                  </a>
                ))}
                <Dropdown.Divider />
                <Dropdown.Item
                  data-name="snapshots"
                  content="All Snapshots"
                  active={view === 'snapshots'}
                  icon="image"
                  onClick={this.handleItemClick}
                />
              </Dropdown.Menu>
            </Dropdown>
          )}

        <Menu.Menu position="right">
          {this.updating ? (
            <Menu.Item>
              <Loader active inline size="mini" />
            </Menu.Item>
          ) : (
            <Menu.Item onClick={this.updateClick} icon="refresh" title="Update Snapshot" />
          )}
          <Menu.Item
            active={this.props.state.autoUpdateSnapshots}
            onClick={() => (this.props.state.autoUpdateSnapshots = !this.props.state.autoUpdateSnapshots)}
            icon="lock"
            title="Auto Update Snapshots"
          />
        </Menu.Menu>
      </Menu>
    );
  }
}
