// nextjs basic auth authentication middleware
export default function authMiddleware(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).send('Unauthorized');
  } else {
    const [type, token] = authorization.split(' ');
    const [username, password] = Buffer.from(token, 'base64')
      .toString()
      .split(':');
    if (username === process.env.USERNAME && password === process.env.PASSWORD) {
      next();
    } else {
      res.status(401).send('Unauthorized');
    }
  }
}

