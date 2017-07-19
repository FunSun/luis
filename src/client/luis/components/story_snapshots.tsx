import * as React from 'react';
import { style } from 'typestyle';
import { observer, inject } from 'mobx-react';
import { StoryType } from '../state/story';

import { MonacoEditor } from './editor';
import { bottomTabPane, toolBelt } from './story_common';
import { TestConfig } from 'fuse-test-runner';
import { StateType } from '../state/state';
import { observable } from 'mobx/lib/mobx';

import { Previews } from './story_previews';

const requireConfig = {
  url: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js',
  paths: {
    vs: 'https://unpkg.com/monaco-editor@0.8.3/min/vs/'
  }
};

const snapshotSelect = style({
  marginLeft: '10px'
});
const pass = style({
  color: 'green'
});
const fail = style({
  color: 'red'
});
const topMenu = style({
  display: 'table',
  background: '#dedede',
  width: '100%',
  padding: '3px',
  $nest: {
    '& div': {
      paddingRight: '6px',
      display: 'table-cell'
    }
  }
});

export interface SnapshotsProps {
  title?: {};
  story: StoryType;
  state?: StateType;
}

export const SnapshotsTitle = inject('state')(
  observer(({ story, state }: SnapshotsProps) => {
    if (state.runningTests) {
      return <span>Snapshots [0/0]</span>;
    }
    if (!story || !story.snapshots || !story.snapshots.length) {
      return <span>No Snapshots</span>;
    }
    return (
      <span>
        [
        <span className={pass}>{story.snapshots.filter(s => s.matching).length}</span> /
        <span className={fail}>{story.snapshots.filter(s => !s.matching).length}</span>]
      </span>
    );
  })
);

function updateSnapshot(button: HTMLButtonElement, story: StoryType, snapshotName: string) {
  while (snapshotName[snapshotName.length - 1].match(/[0-9 ]/)) {
    snapshotName = snapshotName.substring(0, snapshotName.length - 1);
  }
  button.textContent = 'Updating ...';

  const name = fetch(`/tests/snapshots/${story.className}_snapshots.json?update=true&name=${snapshotName}`)
    .then(function(response) {
      return response.text();
    })
    .then(function(text) {
      button.textContent = 'Update Snapshots';
      // remove from memory
      // console.log('Remove: ' + `/tests/snapshots/${story.className}_snapshots.json`);
      FuseBox.remove(`/tests/snapshots/${story.className}_snapshots.json`);
      TestConfig.snapshotCalls = null;

      // rerun tests
      // let story = state.findStoryByClassName(story.className);
      story.startTests();

      // story.snapshots = [];
      // window.location.reload();
    });
}

@inject('state')
@observer
export class Snapshots extends React.PureComponent<SnapshotsProps, {}> {
  render() {
    const { story, state } = this.props;

    if (!story) {
      return <div>No story selected ...</div>;
    }

    if (this.props.state.runningTests) {
      return <div>Running tests ...</div>;
    }

    return (
      <div>
        <div className={topMenu}>
          <div style={{width: '50px'}}>
            <SnapshotsTitle story={story} />
          </div>
          <div style={{width: '100px'}}>
            <a href="javascript:;" style={{ fontWeight: state.snapshotView == 'html' ? 'bold' : 'normal' }} onClick={() => (state.snapshotView = 'html')}>
              HTML{' '}
            </a>
            /{' '}
            <a href="javascript:;" style={{ fontWeight: state.snapshotView == 'json' ? 'bold' : 'normal' }} onClick={() => (state.snapshotView = 'json')}>
              JSON
            </a>
          </div>

          <div style={{width: '150px'}}>
            <a href="javascript:;" style={{ fontWeight: state.snapshotPanes == 'current' ? 'bold' : 'normal' }} onClick={() => (state.snapshotPanes = 'current')}>
              Current{' '}
            </a>
            /{' '}
            <a href="javascript:;" style={{ fontWeight: state.snapshotPanes == 'both' ? 'bold' : 'normal' }} onClick={() => (state.snapshotPanes = 'both')}>
              Both
            </a>
          </div>

          <div>
            <select
              onChange={e => {
                story.activeSnapshot = parseInt(e.currentTarget.value, 10);
              }}
            >
              {story.snapshots && story.snapshots.map((s, i) =>
                <option value={i} key={i}>
                  {s.name}
                </option>
              )}
            </select>
            <button
              className={snapshotSelect}
              onClick={e => updateSnapshot(e.currentTarget, story, story.snapshots[story.activeSnapshot].name)}
            >
              Update Snapshot
            </button>
          </div>
        </div>
        {this.props.state.snapshotView === 'html' && <Previews story={this.props.story} />}
        {this.props.state.snapshotView === 'json' && <SnapshotJSON story={this.props.story} />}
      </div>
    );
  }
}

@inject('state')
@observer
export class SnapshotJSON extends React.PureComponent<SnapshotsProps, {}> {
  editor: monaco.editor.IStandaloneDiffEditor;

  initEditor = (mountEditor: monaco.editor.IStandaloneDiffEditor) => {
    this.editor = mountEditor;
    this.setModel();
  };

  setModel = () => {
    let original = monaco.editor.createModel(
      this.props.story.snapshots[this.props.story.activeSnapshot].current,
      'text/plain'
    );
    let modified = monaco.editor.createModel(
      this.props.story.snapshots[this.props.story.activeSnapshot].expected,
      'text/plain'
    );
    monaco.editor.setModelLanguage(original, 'json');
    monaco.editor.setModelLanguage(modified, 'json');

    this.editor.setModel({ original, modified });
  };

  render() {
    const story = this.props.story;

    if (this.props.state.runningTests) {
      return <div className={bottomTabPane}>Running tests ...</div>;
    }

    if (!story || !story.snapshots || !story.snapshots.length) {
      return <div className={bottomTabPane}>No Snapshots</div>;
    }

    return (
      <div style={{ overflow: 'hidden' }} className={bottomTabPane}>
        <MonacoEditor
          key="HistoryView"
          editorDidMount={this.initEditor}
          theme="vs-light"
          width="100%"
          height="100%"
          clientValue={this.props.story.snapshots[this.props.story.activeSnapshot].current}
          serverValue={this.props.story.snapshots[this.props.story.activeSnapshot].expected}
          requireConfig={requireConfig}
        />
      </div>
    );
  }
}
