'use strict';

const mongoose = require('mongoose');
const { Thread, memoryStore, isMongoConnected } = require('./storage');

async function createReply(board, thread_id, text, delete_password) {
  const normBoard = (board || '').toLowerCase().trim();
  const now = new Date();

  if (isMongoConnected()) {
    const thread = await Thread.findOne({ _id: thread_id, board: normBoard });
    if (!thread) return null;

    const newReply = {
      _id: new mongoose.Types.ObjectId(),
      text,
      delete_password,
      created_on: now,
      reported: false
    };

    thread.replies.push(newReply);
    thread.bumped_on = now;
    await thread.save();
    return newReply;
  }

  const thread = memoryStore.find(t => t._id.toString() === thread_id && t.board === normBoard);
  if (!thread) return null;

  const inMemoryReply = {
    _id: new mongoose.Types.ObjectId().toString(),
    text,
    delete_password,
    created_on: now,
    reported: false
  };

  thread.replies.push(inMemoryReply);
  thread.bumped_on = now;
  return inMemoryReply;
}

async function deleteReply(board, thread_id, reply_id, delete_password) {
  const normBoard = (board || '').toLowerCase().trim();

  if (isMongoConnected()) {
    const thread = await Thread.findOne({ _id: thread_id, board: normBoard });
    if (!thread) return 'incorrect password';

    const reply = thread.replies.id ? thread.replies.id(reply_id) : thread.replies.find(r => r._id.toString() === reply_id);
    if (!reply || reply.delete_password !== delete_password) {
      return 'incorrect password';
    }

    reply.text = '[deleted]';
    await thread.save();
    return 'success';
  }

  const thread = memoryStore.find(t => t._id.toString() === thread_id && t.board === normBoard);
  if (!thread) return 'incorrect password';

  const reply = thread.replies.find(r => r._id.toString() === reply_id);
  if (!reply || reply.delete_password !== delete_password) {
    return 'incorrect password';
  }

  reply.text = '[deleted]';
  return 'success';
}

async function reportReply(board, thread_id, reply_id) {
  const normBoard = (board || '').toLowerCase().trim();

  if (isMongoConnected()) {
    const thread = await Thread.findOne({ _id: thread_id, board: normBoard });
    if (thread) {
      const reply = thread.replies.id ? thread.replies.id(reply_id) : thread.replies.find(r => r._id.toString() === reply_id);
      if (reply) {
        reply.reported = true;
        await thread.save();
      }
    }
    return 'reported';
  }

  const thread = memoryStore.find(t => t._id.toString() === thread_id && t.board === normBoard);
  if (thread) {
    const reply = thread.replies.find(r => r._id.toString() === reply_id);
    if (reply) {
      reply.reported = true;
    }
  }
  return 'reported';
}

module.exports = {
  createReply,
  deleteReply,
  reportReply
};
