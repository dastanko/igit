/* eslint-disable react/prop-types */
import React, { useReducer, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Commit from './Commit';
import PullRequestReview from './PullRequestReview';
import Comment from './Comment';
import MergedEvent from './MergedEvent';
import PullRequestReviewThread from './PullRequestReviewThread';
import RenamedTitleEvent from './RenamedTitleEvent';
import Reference from './Reference';
import Review from './Review';
import flattenUsers from '../../api/utils/flattenUsers';
import Postman from '../Postman';
import roger from '../../jolly-roger';
import isItANewEvent from '../utils/isItANewEvent';
import { AuthorAvatar } from '../utils/getAuthorByEvent';
import camelCaseToRegularText from '../utils/camelCaseToRegularText';
import Horn from '../Horn';

const components = {
  Commit,
  PullRequestReview,
  PullRequestReviewComment: Comment,
  IssueComment: Comment,
  MergedEvent,
  PullRequestReviewThread,
  RenamedTitleEvent,
  CrossReferencedEvent: Reference,
  ReferencedEvent: Reference
};

const filterByUserReducer = function (state, { user }) {
  if (state.find(u => u === user)) {
    return state.filter(u => u !== user);
  }
  return [ ...state, user ];
};

export default function Timeline({ pr, repo }) {
  const { postman } = roger.useContext();
  const [ notifications ] = roger.useState('notifications');
  const users = flattenUsers(pr).map(({ login }) => login);
  const [ filterByAuthor, setFilterByAuthor ] = useReducer(filterByUserReducer, users);
  const [ dimKnownEvents, setDimKnownEvents ] = useState(true);
  const [ profile ] = roger.useState('profile');

  const events = pr.events
    .filter(event => {
      if (filterByAuthor.length > 0) {
        if (event.author) {
          return filterByAuthor.find(u => u === event.author.login);
        } else if (event.type === 'PullRequestReviewThread') {
          return event.comments.find(comment => filterByAuthor.find(u => u === comment.author.login));
        }
        return false;
      }
      return true;
    })
    .map((event, key) => {
      if (dimKnownEvents && !isItANewEvent(event, notifications, profile)) {
        return (
          <div key={ event.id } className='media small timeline-thread-comment dim relative'>
            <AuthorAvatar event={ event } />
            <span>{ camelCaseToRegularText(event.type) }</span>
            <Horn events={ [event] } />
          </div>
        );
      }
      const Component = components[event.type];

      if (event.type === 'PullRequestReview' && event.state === 'PENDING') {
        return null;
      }

      if (Component) {
        return <Component event={ event } key={ event.id + '_' + key } pr={ pr } repo={ repo }/>;
      }
      return <div key={ key }>{ event.type }</div>;
    });

  useEffect(() => {
    users.forEach(user => {
      if (filterByAuthor.indexOf(user) < 0) {
        setFilterByAuthor({ user });
      }
    });
  }, [ pr.id ]);

  return (
    <div className='timeline'>
      <section className='filter mb1'>
        <label key='only-new'>
          <input
            type='checkbox'
            checked={ dimKnownEvents }
            onChange={ () => setDimKnownEvents(!dimKnownEvents) }/>
          Dim known events
        </label>
        {
          users.map(user => (
            <label key={ user }>
              <input
                type='checkbox'
                checked={ !!filterByAuthor.find(u => u === user) }
                onChange={ () => setFilterByAuthor({ user }) }/>
              { user }
            </label>
          ))
        }
      </section>
      { events }
      <div className='timeline-thread-comment my03'>
        <Postman
          resetOnSave
          handler={ postman({ repo, pr }).newTimelineComment }
          placeholder='Leave a comment' />
      </div>
      <Review pr={ pr } repo={ repo }/>
    </div>
  );
};

Timeline.propTypes = {
  pr: PropTypes.object.isRequired,
  repo: PropTypes.object.isRequired
};
