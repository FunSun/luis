import * as React from 'react';
import * as RcCollapse from 'rc-collapse';
import { style } from 'typestyle';
import { StoryType } from '../state/story';
import { StateType, Folder } from '../state/state';
import { inject, observer } from 'mobx-react';
import { Icon } from 'semantic-ui-react';

const Collapse = RcCollapse.default;
const Panel = RcCollapse.Panel;

let toName = function (str: string) {
  let result = str.replace(/\:/g, '');
  result = result.replace(/ - /g, '-');
  result = result.replace(/\W/g, '-');
  do {
    result = result.replace(/--/g, '-');
  } while (result.indexOf('--') >= 0);
  return result.toLowerCase();
};

export const menu = style({
  background: '#eee',
  $nest: {
    'ul': {
      listStyleType: 'none',
      padding: '0px',
      margin: '0px!important'
    },
    '.rc-collapse-content': {
      margin: '0px 0px!important',
      padding: '0px 0px 0px 12px!important',
      background: 'inherit!important'
    },
    '.rc-collapse-content-box': {
      margin: '0px 0px!important'
    },
    'a': {
      cursor: 'pointer'
    },
    'li': {
      margin: '3px 0px 6px 20px'
    }
  }
});

export interface Props {
  folder: Folder;
  path: number[];
  state?: StateType;
}

export const StoryGroupView = inject('state')(observer(({ folder, path, state }: Props): JSX.Element => {
  if (path) {
    // remove first element
    path.shift();
  }
  return (
    <div>
      {
        folder.folders.length > 0 ? (
          <Collapse accordion={true} defaultActiveKey={path && path.length ? path[0].toString() : undefined}>
            {
              folder.folders.sort((a, b) => a.name > b.name ? 1 : -1).map((g, i) => (
                <Panel key={i} header={g.name} className={menu}>
                  <StoryGroupView folder={g} path={path && path.length && i === path[0] ? path : undefined} />
                </Panel>
              ))
            }
          </Collapse>
        ) : false
      }
      <ul>
        {
          folder.stories.sort((a, b) => a.name > b.name ? 1 : -1).map((s: StoryType, i: number) => {
            let currentPath = [folder.parent.folders.indexOf(folder), i];
            let parent = folder.parent;
            let name = toName(folder.name) + '-' + toName(s.name);
            while (parent.parent != null) {
              currentPath.unshift(parent.parent.folders.indexOf(parent));
              name = toName(parent.name) + '-' + name;
              parent = parent.parent;
            }
            const urlPath = currentPath.join('-');
            return (
              <li key={s.name + i}>
                <a 
                  href={`/${name}/${urlPath}`} 
                  onClick={(e) => {
                    e.preventDefault();
                    state.view.openStory(name, urlPath);
                    return false;
                  }}
                >{s.name}
                </a>
                { 
                  s == state.activeStory && s.snapshots && s.snapshots.length > 0 && (
                    <ul>
                      { s.snapshots.map((sn, index) => (
                        <li key={index} style={state.view.selectedSnapshot.toString() === index.toString() ? { fontWeight: 'bold' } : {}}><a href={`/${name}/${urlPath}/${index}`} onClick={(e) => {
                          e.preventDefault();
                          state.view.openStory(name, urlPath, index);
                          return false;
                        }}><Icon name="file" />{ sn.name }</a></li>
                      )) }
                    </ul>
                  )
                }                
              </li>
            );
          })
        }
      </ul>
    </div>
  );
}));