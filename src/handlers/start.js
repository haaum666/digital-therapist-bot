import { InlineKeyboard } from "grammy";

const startHandler = async (ctx) => {
  const inlineKeyboard = new InlineKeyboard()
    .text("Полная диагностика", "full_diagnosis")
    .text("Проверка по блокам", "by_blocks");

  await ctx.reply("Привет! Я Digital-терапевт для бизнеса, и я готов провести быструю диагностику вашего бизнеса. Мы можем пойти двумя путями: Полная диагностика или Проверка по блокам.", {
    reply_markup: inlineKeyboard
  });
};

export default startHandler;
