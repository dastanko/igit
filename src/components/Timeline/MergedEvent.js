import React from 'react';
import PropTypes from 'prop-types';

import Date from '../utils/Date';
import { GIT_MERGE } from '../Icons';
import { withHorn } from '../Horn';

function MergedEvent({ event }) {
  return (
    <div className='timeline-thread-comment media small relative' id={event.id}>
      <img src={event.author.avatar} className='avatar' title={event.author.login} />
      <div>
        {event.author.login}&nbsp;
        <Date event={event} />
        &nbsp;
        <GIT_MERGE size={18} />
        <small>merged to</small> <span className='branch'>{event.ref}</span>
      </div>
    </div>
  );
}

MergedEvent.propTypes = {
  event: PropTypes.object.isRequired
};

export default withHorn(MergedEvent);
