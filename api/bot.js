import { Bot, webhookCallback } from "grammy";

// Получаем токен из переменных окружения Vercel
const BOT_TOKEN = process.env.BOT_TOKEN;

// Создаем экземпляр бота
const bot = new Bot(BOT_TOKEN);

// Обработчик команды /start
bot.command("start", async (ctx) => {
  await ctx.reply("Здравствуйте! Я Digital-терапевт для бизнеса, и готов провести быструю диагностику вашего бизнеса. Мы можем пойти двумя путями: Полная диагностика или Проверка по блокам.");
});

// Обработчик всех остальных сообщений
bot.on("message", (ctx) => ctx.reply("Я пока умею отвечать только на команду /start."));

// Экспортируем обработчик для Vercel
export default webhookCallback(bot, "express");
