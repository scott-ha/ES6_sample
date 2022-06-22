import express from 'express';

const router = express.Router();

/* GET home page. */
router.get('/1', (req, res) => {
  res.render('index', { title: 'Express' });
});

export default router;
