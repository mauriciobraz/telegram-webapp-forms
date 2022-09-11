import { useEffect, useRef } from 'react';
import { useIsTelegramWebAppReady } from 'react-telegram-webapp';

import { Form } from '@unform/web';
import type { FormHandles, SubmitHandler } from '@unform/core';
import type { NextPage } from 'next';

import { ButtonInput } from '../components/ButtonInput';
import { TextareaInput } from '../components/TextareaInput';
import { TextInput } from '../components/TextInput';

const Home: NextPage = () => {
  const formRef = useRef<FormHandles>(null);
  const isTelegramWebAppReady = useIsTelegramWebAppReady();

  useEffect(() => {
    if (!isTelegramWebAppReady) return;

    window.Telegram.WebApp.MainButton.text = 'Submit';
    window.Telegram.WebApp.MainButton.show();

    window.Telegram.WebApp.onEvent('mainButtonClicked', () =>
      formRef.current?.submitForm()
    );
  }, [isTelegramWebAppReady]);

  // TODO: Fix the being rerender 28 times.
  const handleSubmit: SubmitHandler = data => {
    console.count('handleSubmit');
  };

  return (
    <div className="my-4 m-0 px-2.5">
      <Form ref={formRef} onSubmit={handleSubmit}>
        <TextInput
          label="Text Input"
          name="text"
          type="text"
          placeholder="This is a text input, write whatever you like!"
          required={true}
        />

        <TextareaInput
          label="Textarea Input"
          name="textarea"
          placeholder="That one is like text input, but bigger."
        />

        <ButtonInput
          label="Buttons Input"
          name="terms"
          options={[
            { name: 'First', value: 'true' },
            { name: 'Second', value: 'false' },
          ]}
          required={true}
        />
      </Form>
    </div>
  );
};

export default Home;
