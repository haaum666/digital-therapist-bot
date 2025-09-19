import { Bot, webhookCallback } from "grammy";
import startHandler from "../src/handlers/start.js";
import buttonsHandler from "../src/handlers/buttons.js";

// Получаем токен из переменных окружения Vercel
const BOT_TOKEN = process.env.BOT_TOKEN;

// Создаем экземпляр бота
const bot = new Bot(BOT_TOKEN);

// Обработчик команды /start
bot.command("start", startHandler);

// Обработчик нажатий на инлайн-кнопки
bot.on("callback_query:data", buttonsHandler);

// Экспортируем обработчик для Vercel
export default webhookCallback(bot, "express");
