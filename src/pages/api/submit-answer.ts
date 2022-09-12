import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message: string;
};

const ROUTE = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/answerWebAppQuery`;
const REQUIRED_FIELDS = [
  'id',
  'webAppQueryId',
  'inputMessageTitle',
  'inputMessageContent',
];

// NOTE: This post will destroy the webapp, use it carefully.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405);
  }

  if (!REQUIRED_FIELDS.every(field => req.body[field])) {
    const missingFields = REQUIRED_FIELDS.filter(field => !req.body[field]);

    return res
      .status(400)
      .json({ message: `Missing field(s) ${missingFields.join(', ')}` });
  }

  await axios.post(ROUTE, {
    web_app_query_id: req.body.webAppQueryId,
    result: {
      id: req.body.id,
      type: 'article',
      title: req.body.inputMessageTitle,
      input_message_content: {
        message_text: `${req.body.inputMessageContent} (ID: ${req.body.id})`,
      },
    },
  });

  return res
    .status(200)
    .json({ message: `Answer submitted successfully with ID ${req.body.id}` });
}
