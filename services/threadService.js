'use strict';

const mongoose = require('mongoose');
const {
  Thread,
  memoryStore,
  isMongoConnected,
  formatThreadForBoard,
  formatThreadWithAllReplies
} = require('./storage');

async function createThread(board, text, delete_password) {
  const normBoard = (board || '').toLowerCase().trim();
  const now = new Date();

  if (isMongoConnected()) {
    const newThread = new Thread({
      board: normBoard,
      text,
      delete_password,
      created_on: now,
      bumped_on: now,
      reported: false,
      replies: []
    });
    return await newThread.save();
  }

  const inMemoryThread = {
    _id: new mongoose.Types.ObjectId().toString(),
    board: normBoard,
    text,
    delete_password,
    created_on: now,
    bumped_on: now,
    reported: false,
    replies: []
  };
  memoryStore.push(inMemoryThread);
  return inMemoryThread;
}

async function getThreads(board) {
  const normBoard = (board || '').toLowerCase().trim();

  if (isMongoConnected()) {
    const threads = await Thread.find({ board: normBoard })
      .sort({ bumped_on: -1 })
      .limit(10)
      .lean();
    return threads.map(formatThreadForBoard);
  }

  return memoryStore
    .filter(t => t.board === normBoard)
    .sort((a, b) => new Date(b.bumped_on) - new Date(a.bumped_on))
    .slice(0, 10)
    .map(formatThreadForBoard);
}

async function getThread(board, thread_id) {
  const normBoard = (board || '').toLowerCase().trim();

  if (isMongoConnected()) {
    const thread = await Thread.findOne({ _id: thread_id, board: normBoard }).lean();
    return thread ? formatThreadWithAllReplies(thread) : null;
  }

  const thread = memoryStore.find(t => t._id.toString() === thread_id && t.board === normBoard);
  return thread ? formatThreadWithAllReplies(thread) : null;
}

async function deleteThread(board, thread_id, delete_password) {
  const normBoard = (board || '').toLowerCase().trim();

  if (isMongoConnected()) {
    const thread = await Thread.findOne({ _id: thread_id, board: normBoard });
    if (!thread || thread.delete_password !== delete_password) {
      return 'incorrect password';
    }
    await Thread.deleteOne({ _id: thread_id });
    return 'success';
  }

  const idx = memoryStore.findIndex(t => t._id.toString() === thread_id && t.board === normBoard);
  if (idx === -1 || memoryStore[idx].delete_password !== delete_password) {
    return 'incorrect password';
  }
  memoryStore.splice(idx, 1);
  return 'success';
}

async function reportThread(board, thread_id) {
  const normBoard = (board || '').toLowerCase().trim();

  if (isMongoConnected()) {
    await Thread.updateOne({ _id: thread_id, board: normBoard }, { reported: true });
    return 'reported';
  }

  const thread = memoryStore.find(t => t._id.toString() === thread_id && t.board === normBoard);
  if (thread) {
    thread.reported = true;
  }
  return 'reported';
}

module.exports = {
  createThread,
  getThreads,
  getThread,
  deleteThread,
  reportThread
};
