import type { ParsedUrlQuery } from 'querystring';

import React, { useEffect, useRef } from 'react';
import { useIsTelegramWebAppReady } from 'react-telegram-webapp';

import { Form } from '@unform/web';
import axios from 'axios';
import { useRouter } from 'next/router';
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
  const { query } = useRouter();
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
    const initData = Object.fromEntries(new URLSearchParams(WebApp.initData));
    const initDataUser = JSON.parse(initData.user);

    // This post will destroy the webapp, use it only once finished every task.
    await axios.post('/api/submit-answer', {
      data: { form: data, userId: initDataUser.id },
      webAppQueryId: initData.query_id,
      inputMessageTitle: 'Answer Submission',
      inputMessageContent: 'Hey, I answered my form!',
    });
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
    <div className="my-4 m-0 px-2.5">
      <h1 className="my-4 mb-4 font-extrabold text-2xl text-center">
        {form.title}
      </h1>

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
    };

  return {
    props: {
      form: JSON.parse(JSON.stringify(form)),
    },
  };
};
