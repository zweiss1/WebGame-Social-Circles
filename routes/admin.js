const express = require('express');
const router = express.Router();
const connection = require('../database');



function requireAdmin(req, res, next) {
    if (!req.session?.user) {
      return res.status(401).json({ error: 'LOGIN_REQUIRED' });
    }
  
    // fast path – trust the session bit
    if (req.session.isAdmin) return next();
  
    // slow path – check DB in case the session is stale
    connection.query('SELECT isAdmin FROM user_information WHERE username = ?',
      [req.session.user],
      (err, rows) => {
        if (err) return next(err);
        const ok = !!(rows.length && rows[0].isAdmin === 1);
        req.session.isAdmin = ok;         // cache for next time
        if (ok) return next();
        return res.status(403).json({ error: 'ADMIN_REQUIRED' });
      });
  }

  router.delete('/user/:username', requireAdmin, (req, res, next) => {
    const user = req.params.username;
    connection.getConnection((err, conn) => {
      if (err) return next(err);
  
      conn.beginTransaction(err => {
        if (err) {
          conn.release();
          return next(err);
        }
        conn.query(
          'DELETE FROM friendships WHERE username = ? OR friend_username = ?',
          [user, user],
          (err) => {
            if (err) return rollback(err);
            conn.query(
              'DELETE FROM user_information WHERE username = ?',
              [user],
              (err, result) => {
                if (err) return rollback(err);
  
                conn.commit(err => {
                  if (err) return rollback(err);
                  conn.release();
                  return res.json({ ok: true, message: `Users removed: ${result.affectedRows}` });
                });
              }
            );
          }
        );
        //function to rollback friendships if the hard-delete had a error
        function rollback(e) {
          conn.rollback(() => conn.release());
          if (e.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
              error: 'USER_REFERENCED',
              message: `${user} has related rows – deactivate or cascade-delete them first`
            });
          }
          return next(e);
        }
      });
    });
});

//Code to delete a user
/**
  fetch('/admin/user/cheese', {
  method: 'DELETE',
  credentials: 'same-origin'
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
 */



module.exports = router;