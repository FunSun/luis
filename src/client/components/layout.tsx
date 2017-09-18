import * as React from 'react';
import * as SplitPane from 'react-split-pane';

import { Sidebar, Segment, Menu, Icon, Header } from 'semantic-ui-react';

import { style } from 'typestyle';
import { StateModel } from '../config/state';
import { ITheme } from '../config/themes';
import { inject, observer } from "mobx-react";
import { StoryList } from "./story_list";
import { SideBar } from './side_bar';

import DevTools from 'mobx-react-devtools';
import { TopPanel } from './top_panel';
import { StoryComponent } from './story_component';

const split = (theme: ITheme) =>
  style({
    background: theme.backgroundColor,
    color: theme.textColor + '!important',
    $nest: {
      '& .Resizer': {
        background: '#000',
        opacity: 0.2,
        zIndex: 1,
        boxSizing: 'border-box',
        backgroundClip: 'padding-box'
      },
      '& .Resizer:hover': {
        transition: 'all 2s ease'
      },
      '& .Resizer.horizontal': {
        height: '11px',
        margin: '-5px 0',
        borderTop: '6px solid rgba(255, 255, 255, 0)',
        borderBottom: '5px solid rgba(255, 255, 255, 0)',
        cursor: 'row-resize',
        width: '100%'
      },
      '& .Resizer.horizontal:hover': {
        borderTop: '5px solid rgba(0, 0, 0, 0.5)',
        borderBottom: '5px solid rgba(0, 0, 0, 0.5)'
      },
      '& .Resizer.vertical': {
        width: '11px',
        margin: '0 -5px',
        borderLeft: '5px solid rgba(255, 255, 255, 0)',
        borderRight: '5px solid rgba(255, 255, 255, 0)',
        cursor: 'col-resize'
      },
      '& .Resizer.vertical:hover': {
        borderLeft: '5px solid rgba(0, 0, 0, 0.5)',
        borderRight: '5px solid rgba(0, 0, 0, 0.5)'
      },
      '& .SplitPane.horizontal': {
        position: 'inherit!important' as any
      }
    }
  });

const pane = style({
  padding: '6px'
});

const content = style({
  position: 'absolute',
  left: 60,
  right: 0,
  top: 0,
  bottom: 0,
  fontFamily: 'Lato'
})

type Props = {
  state?: App.State;
}

export const Layout = inject<Props>('state')(observer(({ state }: Props) => (
  <div>
    <SideBar />
    <div className={content}>
      <SplitPane
        className={split(state.theme)}
        split="vertical"
        minSize={100}
        defaultSize={parseInt(localStorage.getItem('luis-v-splitPos'), 10)}
        onChange={(size: string) => localStorage.setItem('luis-v-splitPos', size)}
      >
        <div className={pane}>
          <StoryList />
          <DevTools position={{right: 200, top: 0}} />
        </div>
        <div>
          <TopPanel />
          <div className={pane}>
            <StoryComponent state={state} />
          </div>
        </div>
      </SplitPane>
    </div>
  </div>
)));
