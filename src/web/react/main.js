// @flow

import React from 'react';
import { connect } from 'react-redux';
import { format as timeago } from 'timeago.js';
import { DateTime } from 'luxon';
import styled from '@emotion/styled/macro';

import * as service from '../service';
import type { State, HTTP, Attachment } from '../types';

type MainState = {||};

type MainProps = {|
  onMount: () => void,
  homeGET: HTTP<Attachment[]>,
|};

const Layout = styled.main`
  max-width: 1024px;
  margin: 0 auto;

  & > footer {
    font-size: smaller;
    opacity: 0.8;
    margin-top: 2rem;
    border-top: 1px solid #889;
    padding-top: 0.5rem;
    text-align: right;
  }
`;

const LinksLayout = styled.section``;

const LinkLayout = styled.article`
  pre {
    font-size: 8pt;
  }
`;

const Thumbnail = styled.aside`
  float: left;
  width: 250px;
  text-align: right;
  height: 100px;

  & > img {
    border-radius: 2px;
    object-fit: contain;
    max-width: 100%;
    max-height: 100%;
  }
`;

const Text = styled.main`
  margin: 1rem 0;
  margin-left: calc(250px + 1rem);

  & > h2 {
    margin-bottom: 0.75rem;
  }

  & > h2 > a {
    font-size: larger;
    display: inline-block;
  }

  & > h2 > .tag {
    display: inline-block;
    margin-left: 0.5rem;
  }
`;

const Clear = styled.div`
  clear: both;
`;

const link = 'https://github.com/hlian/links';

const humanizeChannel = (channel: string) => {
  switch (channel) {
    case 'C09F8B1J7':
      return '#compose';
    default:
      return channel;
  }
};

const humanizeDate = (date: string): string => {
  const um = DateTime.fromISO(date);
  return timeago(+um);
};

const Links = ({ links }) => (
  <LinksLayout>
    <h1>Links</h1>
    {links.map(link => (
      <LinkLayout key={link.id}>
        <Thumbnail>
          {link.slack.thumb_url && (
            <img src={link.slack.thumb_url} width={link.slack.thumb_width} height={link.slack.thumb_height} />
          )}
        </Thumbnail>
        <Text>
          <h2>
            <a href={link.slack.title_link}>{link.slack.title}</a>
            <span className="tag">{humanizeChannel(link.channel)}</span>
          </h2>
          <ul>
            <li>date: {humanizeDate(link.date)}</li>
          </ul>
        </Text>
        <Clear />
      </LinkLayout>
    ))}
  </LinksLayout>
);

class MainMeat extends React.Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);
  }

  componentDidMount() {
    this.props.onMount();
  }

  render() {
    const { homeGET } = this.props;
    return (
      <Layout>
        {homeGET.id === 'wait' ? 'reticulating splines...' : null}
        {homeGET.id === 'bad' ? 'server is down or something :(' : null}
        {homeGET.id === 'good' ? <Links links={homeGET.reward} /> : null}
        <footer>
          pull requests badly needed <a href={link}>{link}</a>
        </footer>
      </Layout>
    );
  }
}

const Main = connect(
  (state: State) => ({
    homeGET: state.homeGET,
  }),
  dispatch => ({
    onMount: () => {
      dispatch({ type: 'homeGET', fetch: service.homeGET() });
    },
  })
)(MainMeat);

export { Main };
