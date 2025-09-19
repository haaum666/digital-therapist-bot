import { Telegraf } from 'telegraf';
import { supabase } from '../src/database/db.js';
import { startDialog, handleAnswer } from '../src/handlers/dialog.js';
import { handleButtonPress } from '../src/handlers/buttons.js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Обработка команды /start
bot.start(async (ctx) => {
  await ctx.reply(`Привет, ${ctx.from.first_name}! Я Digital-терапевт.
  
Я здесь, чтобы помочь тебе провести диагностику твоего бизнеса и найти слабые места, которые мешают ему расти в онлайне.
  
Выбери один из вариантов диагностики:`, {
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
bot.on('text', async (ctx) => {
  await handleAnswer(ctx);
});

// Обработка нажатий на кнопки
bot.on('callback_query', async (ctx) => {
  await handleButtonPress(ctx);
});

// Vercel будет использовать эту функцию для обработки запросов
export default async (req, res) => {
  if (req.method === 'POST') {
    await bot.handleUpdate(req.body, res);
  } else {
    res.status(200).send('Bot is running');
  }
};
