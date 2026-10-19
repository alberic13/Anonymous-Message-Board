'use strict';

const threadController = require('../controllers/threadController');
const replyController = require('../controllers/replyController');

module.exports = function (app) {
  app.route('/api/threads/:board')
    .post(threadController.createThread)
    .get(threadController.getThreads)
    .put(threadController.reportThread)
    .delete(threadController.deleteThread);

  app.route('/api/replies/:board')
    .post(replyController.createReply)
    .get(replyController.getReplies)
    .put(replyController.reportReply)
    .delete(replyController.deleteReply);
};
