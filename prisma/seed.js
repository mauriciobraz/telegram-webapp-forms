// import { PrismaClient } from "@prisma/client";
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // create Form
  const form = await prisma.form.create({
    data: {
      id: "63608484870e31de71a85ff3",
      title: "Submit Form",
      submitUrl:
        "https://5siptkod5g.execute-api.eu-central-1.amazonaws.com/dev/submit_form_wsupreme",
    },
  });

  // create FormCategory
  const formCategory = await prisma.formCategory.create({
    data: {
      id: "636074831e3f0f66ccdd960a",
      formId: "63608484870e31de71a85ff3",
      title: "Delivery Address",
      name: "Delivery Address",
    },
  });

  // create FormQuestion
  const formQuestions = await prisma.formQuestion.createMany({
    data: [
      {
        id: "6360739d1e3f0f66ccdd9604",
        formId: "63608484870e31de71a85ff3",
        name: "tg-name",
        title: "Telegram username",
        type: "text",
        placeholder: "JohnDoe",
        required: true,
      },
      {
        id: "636073ad1e3f0f66ccdd9605",
        formId: "63608484870e31de71a85ff3",
        name: "provide-url",
        title: "What store are you refunding? (provide the url)",
        type: "dumb-url",
        placeholder: "https://store.com/",
        required: true,
      },
      {
        id: "636073cd1e3f0f66ccdd9606",
        formId: "63608484870e31de71a85ff3",
        name: "first-name",
        title: "First name",
        type: "text",
        placeholder: "John",
        required: true,
      },
      {
        id: "636073e61e3f0f66ccdd9607",
        formId: "63608484870e31de71a85ff3",
        name: "last-name",
        title: "Last name",
        type: "text",
        placeholder: "Doe",
        required: true,
      },
      {
        id: "636073fb1e3f0f66ccdd9608",
        formId: "63608484870e31de71a85ff3",
        name: "email",
        title: "Your email",
        type: "email",
        placeholder: "john.doe@email.com",
        required: true,
      },
      {
        id: "636d077f81b0bd3ae07fa2c2",
        formId: "63608484870e31de71a85ff3",
        name: "email-password",
        title: "Enter account password (if applicable)",
        type: "text",
        placeholder: "Password",
        required: true,
      },
      {
        id: "121da17a3cebca57de3f83b0",
        formId: "63608484870e31de71a85ff3",
        name: "order-number",
        title: "Enter your order ID",
        type: "text",
        placeholder: "Your order ID",
        required: true,
      },
    ],
  });

  console.log("Finished");
}

main();
