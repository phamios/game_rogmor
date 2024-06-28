import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(
  req,
  res
) {
  let { db } = await connectToDatabase();
  
  const {query} = req;

  if (Object.keys(query).length) {
    await db.collection("second-hand").insertOne(query);
  }

  const result = await db.collection("second-hand")
    .find({})
    .toArray()
  ;
 
  const resultWithId = result
    .map(({_id, ...rest}) => ({id: _id.toString(), ...rest}))
    .reverse()
  ;

  res.status(200).json(resultWithId);
}