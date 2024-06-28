import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
req: NextApiRequest,
  res: NextApiResponse
) {

  if (!req.query?.seek) return res.status(404).json({msg:"- - Seek something? - -"});

  const key = process.env.GPT_3_KEY || '- - -';

  const headers = new Headers({
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  });

  fetch(
    "https://api.openai.com/v1/images/generations",
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        "prompt": req.query.seek,
        "n": +req.query.n ?? 1,
        "size": req.query.size || "256x256",
      })
    }
  )
  .then(r => r.json())
  .then(msg => res.status(200).json(msg))
  .catch(error => res.status(404).json(error))
}