import { connectToDatabase } from "../../lib/mongodb";
// import sha256 from 'crypto-js/sha256';

const blogCollection = process.env.BLOG_COLLECTION

export default async function handler(
  req,
  res,
) {
  let { db } = await connectToDatabase();
  
  const {query:{msg, avatar, name} = {}} = req;

  if (msg && avatar && name) {
    await db.collection(blogCollection).insertOne({
      msg, 
      avatar, 
      name
    });
  }

  const result = await db.collection(blogCollection)
    .find({})
    .sort({$natural:-1})
    .limit(22)
    .toArray()
  ;
 
  const resultWithId = result
    .map(({_id, ...rest}) => ({id: _id.toString(), ...rest}))
  ;

  res.status(200).json(resultWithId);
}