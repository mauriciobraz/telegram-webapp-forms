import type { ParsedUrlQuery } from 'querystring';

import React, { useEffect, useRef } from 'react';
import { useIsTelegramWebAppReady } from 'react-telegram-webapp';

import { Form } from '@unform/web';
import axios from 'axios';
import type { Form as PForm, FormCategory, FormQuestion } from '@prisma/client';
import type { FormHandles, SubmitHandler } from '@unform/core';
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next';

import { ButtonInput } from '../../components/ButtonInput';
import { TextareaInput } from '../../components/TextareaInput';
import { TextInput } from '../../components/TextInput';
import prisma from '../../libs/prisma';

type Props = InferGetStaticPropsType<typeof getStaticProps>;

type RenderQuestionProps = {
  data: FormQuestion;
  index: number;
};

const GetForm: NextPage<Props> = ({ form }) => {
  const formRef = useRef<FormHandles>(null);
  const isReady = useIsTelegramWebAppReady();

  const { WebApp } = window.Telegram;

  useEffect(() => {
    if (!isReady) return;

    const { WebApp } = window.Telegram;

    WebApp.MainButton.setParams({ text: 'Submit' })
      .onClick(() => formRef.current?.submitForm())
      .show();
  }, [isReady]);

  const handleSubmit: SubmitHandler = async data => {
    if (!process.env.NEXT_PUBLIC_SUBMIT_DATA_URL) {
      throw new Error('NEXT_PUBLIC_SUBMIT_DATA_URL is not defined.');
    }

    const initData = Object.fromEntries(new URLSearchParams(WebApp.initData));
    const initDataUser = JSON.parse(initData.user);

    // TODO: Implement better security in generating this ID.
    // E.g. generate it in backend and return to front.
    const id = crypto.randomUUID();

    await axios.post(process.env.NEXT_PUBLIC_SUBMIT_DATA_URL, {
      id,
      form: data,
      userId: initDataUser.id,
    });

    // This post will destroy the webapp, use it only once finished every task.
    await axios.post('/api/submit-answer', {
      id,
      webAppQueryId: WebApp.initDataUnsafe.query_id,
      inputMessageTitle: 'Answer Submission',
      inputMessageContent: 'Hey, I answered my form!',
    });
  };

  const renderQuestion: React.FC<RenderQuestionProps> = ({ data, index }) => {
    switch (data.type) {
      case 'button':
        return (
          <ButtonInput
            key={index}
            name={data.name}
            label={data.title ?? undefined}
            required={data.required ?? undefined}
            options={data.options as any}
          />
        );

      case 'textarea':
        <TextareaInput
          key={index}
          name={data.name}
          label={data.title ?? undefined}
          placeholder={data.placeholder ?? undefined}
          required={data.required ?? undefined}
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
          />
        );
    }
  };

  const formQuestionsWithoutCategory = form.FormQuestion.filter(question =>
    form.FormCategory.some(category =>
      category.Question.some(
        questionFromCategory => questionFromCategory.id !== question.id
      )
    )
  );

  console.log(form);

  return (
    <div className="my-4 m-0 px-2.5">
      <h1 className="mb-4 text-2xl font-bold">{form.title}</h1>

      <Form ref={formRef} onSubmit={handleSubmit}>
        {(form.FormCategory.length > 0
          ? formQuestionsWithoutCategory
          : form.FormQuestion
        ).map((question, index) =>
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

export default GetForm;

export const getStaticPaths = async () => {
  const paths = await prisma.form.findMany({
    select: { id: true },
  });

  return {
    paths: paths.map(form => ({ params: form })),
    fallback: true,
  };
};

interface IParams extends ParsedUrlQuery {
  id: string;
}

interface IResult {
  form: PForm & {
    FormQuestion: FormQuestion[];
    FormCategory: (FormCategory & { Question: FormQuestion[] })[];
  };
}

export const getStaticProps: GetStaticProps<IResult> = async ({ params }) => {
  const { id } = params as IParams;

  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      FormCategory: { include: { Question: true } },
      FormQuestion: true,
    },
  });

  if (!form)
    return {
      notFound: true,
      redirect: '/404',
    };

  return {
    props: {
      form: JSON.parse(JSON.stringify(form)),
    },
  };
};
