import type { ParsedUrlQuery } from 'querystring';

import React, { useEffect, useRef } from 'react';
import { useIsTelegramWebAppReady } from 'react-telegram-webapp';

import { Form } from '@unform/web';
import Axios from 'axios';
import { useRouter } from 'next/router';
import type { Form as PForm, FormCategory, FormQuestion } from '@prisma/client';
import type { FormHandles, SubmitHandler } from '@unform/core';
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next';

import { ButtonInput } from '../../components/ButtonInput';
import { TextareaInput } from '../../components/TextareaInput';
import { TextInput } from '../../components/TextInput';
import prisma from '../../libs/prisma';
import { NextApiRequestType, NextApiResponseType } from '../api/submit-answer';

type Props = InferGetStaticPropsType<typeof getStaticProps>;

interface RenderQuestionProps {
  data: FormQuestion;
  index: number;
}

const Page: NextPage<Props> = ({ form }) => {
  const { query } = useRouter();
  const formRef = useRef<FormHandles>(null);
  const isReady = useIsTelegramWebAppReady();

  const { WebApp } = window.Telegram;

  console.log(WebApp.initDataUnsafe.user?.id);

  useEffect(() => {
    if (!isReady) return;

    const { WebApp } = window.Telegram;

    WebApp.MainButton.setParams({ text: 'Submit' })
      .onClick(() => formRef.current?.submitForm())
      .show();

    WebApp.expand();
    WebApp.enableClosingConfirmation();
  }, [isReady]);

  const handleSubmit: SubmitHandler = async data => {
    const initData = Object.fromEntries(new URLSearchParams(WebApp.initData));
    const initDataUser = JSON.parse(initData.user);

    // This post will destroy the webapp, use it only once finished every task.
    await Axios.post<NextApiResponseType>('/api/submit-answer', {
      data: { form: data, userId: initDataUser.id },
      submitUrl: form.submitUrl,
      webAppQueryId: initData.query_id,
      inputMessageTitle: 'Answer Submission',
      inputMessageContent: 'Hey, I answered my form!',
    } as NextApiRequestType);
  };

  const renderQuestion: React.FC<RenderQuestionProps> = ({ data, index }) => {
    let defaultValue = query[data.name];

    switch (data.type) {
      case 'button':
        return (
          <ButtonInput
            key={index}
            name={data.name}
            defaultValue={defaultValue}
            required={data.required ?? undefined}
            options={data.options as any}
            label={data.title ?? undefined}
          />
        );

      case 'textarea':
        <TextareaInput
          key={index}
          name={data.name}
          label={data.title ?? undefined}
          placeholder={data.placeholder ?? undefined}
          required={data.required ?? undefined}
          defaultValue={defaultValue}
        />;

      default:
        return (
          <TextInput
            key={index}
            name={data.name}
            label={data.title ?? undefined}
            placeholder={data.placeholder ?? undefined}
            required={data.required ?? undefined}
            type={(data.type as any) ?? 'text'}
            defaultValue={defaultValue}
          />
        );
    }
  };

  const formQuestionsWithoutCategory = form.FormQuestion.filter(
    question =>
      !form.FormCategory.some(category =>
        category.Question.some(
          questionFromCategory => questionFromCategory.id === question.id
        )
      )
  );

  return (
    <div className="m-0 my-4 px-2.5">
      <h1 className="my-4 text-center text-2xl font-extrabold">{form.title}</h1>

      <Form ref={formRef} onSubmit={handleSubmit}>
        {formQuestionsWithoutCategory.map((question, index) =>
          renderQuestion({
            data: question,
            index,
          })
        )}

        {form.FormCategory.map((category, index) => (
          <div key={index}>
            <h2 key={index} className="mb-4 text-xl font-bold">
              {category.title}
            </h2>

            {category.Question.map((question, index) =>
              renderQuestion({ data: question, index })
            )}
          </div>
        ))}
      </Form>
    </div>
  );
};

export default Page;

export const getStaticPaths = async () => {
  const rawPaths = await prisma.form.findMany({
    select: {
      id: true,
    },
  });

  return {
    paths: rawPaths.map(form => ({ params: form })),
    fallback: true,
  };
};

interface StaticProps {
  form: PForm & {
    FormQuestion: FormQuestion[];
    FormCategory: (FormCategory & { Question: FormQuestion[] })[];
  };
}

interface IParams extends ParsedUrlQuery {
  id: string;
}

export const getStaticProps: GetStaticProps<StaticProps> = async ({
  params,
}) => {
  const { id } = params as IParams;

  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      FormCategory: {
        include: {
          Question: true,
        },
      },
      FormQuestion: true,
    },
  });

  if (!form)
    return {
      notFound: true,
    };

  return {
    props: { form: JSON.parse(JSON.stringify(form)) },
    revalidate:
      (process.env.FORM_IRS_TIME && parseInt(process.env.FORM_IRS_TIME, 10)) ||
      1800, // 5min
  };
};
