import { randomUUID } from 'crypto';

import axios from 'axios';
import * as Yup from 'yup';
import type { NextApiRequest, NextApiResponse } from 'next';

export type NextApiResponseType = { id: string } | { errors: string[] };

type DataType = {
  form: any;
  userId: string;
};

export type NextApiRequestType = {
  data: DataType;
  submitUrl: string;
  webAppQueryId: string;
  inputMessageTitle: string;
  inputMessageContent: string;
};

const ROUTE = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/answerWebAppQuery`;

const AUTHORIZED_SUBMIT_DOMAINS = (
  process.env.AUTHORIZED_SUBMIT_DOMAINS?.split('|') || []
).map(possibleDomain => new URL(possibleDomain).host);

console.log(Yup);

const VALIDATE_BODY_SCHEMA = Yup.object()
  .shape({
    data: Yup.object()
      .shape({ form: Yup.object().required(), userId: Yup.number().required() })
      .required(),

    submitUrl: Yup.string().url().required(),
    webAppQueryId: Yup.string().required(),
    inputMessageTitle: Yup.string().max(256).required(),
    inputMessageContent: Yup.string().max(256).required(),
  })
  .required();

// NOTE: This post will destroy the webapp, use it carefully.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NextApiResponseType>
) {
  if (req.method !== 'POST') {
    return res.status(405);
  }

  try {
    await VALIDATE_BODY_SCHEMA.validate(req.body);
  } catch (e) {
    if (e instanceof Yup.ValidationError)
      return res
        .status(400)
        .json({ errors: e.inner.map(detail => detail.message) });
  }

  if (!AUTHORIZED_SUBMIT_DOMAINS.includes(new URL(req.body.submitUrl).host)) {
    return res
      .status(400)
      .json({ errors: ['Parameter submitUrl is not authorized.'] });
  }

  const id = randomUUID();

  await axios.post(req.body.submitUrl, {
    id,
    ...req.body.data,
  });

  await axios.post(ROUTE, {
    web_app_query_id: req.body.webAppQueryId,
    result: {
      id,
      type: 'article',
      title: req.body.inputMessageTitle,
      input_message_content: {
        message_text: `${req.body.inputMessageContent} (ID: ${id})`,
      },
    },
  });

  return res.status(200).json({
    id: req.body.id,
  });
}
