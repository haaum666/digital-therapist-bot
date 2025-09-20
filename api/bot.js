import { Bot, webhookCallback } from 'grammy';
import { supabase } from '../src/database/db.js';
import { startDialog, handleAnswer } from '../src/handlers/dialog.js';
import { handleButtonPress } from '../src/handlers/buttons.js';

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

// Обработка команды /start
bot.command('start', async (ctx) => {
  await ctx.reply(`Здравствуйте! Я Digital-терапевт для бизнеса, и готов провести быструю диагностику вашего бизнеса. Мы можем пойти двумя путями: Полная диагностика или Проверка по блокам.`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Полная диагностика', callback_data: 'full_diagnosis' },
        ],
        [
          { text: 'Проверка по блокам', callback_data: 'block_diagnosis' },
        ],
      ],
    },
  });
});

// Обработка текстовых сообщений
bot.on('message', async (ctx) => {
  await handleAnswer(ctx);
});

// Обработка нажатий на кнопки
bot.on('callback_query', async (ctx) => {
  await handleButtonPress(ctx);
});

// Vercel будет использовать эту функцию для обработки запросов
export default async (req, res) => {
  try {
    if (req.method === 'POST') {
      await bot.init();
      await webhookCallback(bot, 'express')(req, res);
    } else {
      res.status(200).send('Bot is running');
    }
  } catch (error) {
    console.error('Ошибка в обработчике Vercel:', error);
    res.status(500).send('Внутренняя ошибка сервера');
  }
};
