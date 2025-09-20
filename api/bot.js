import { Bot, webhookCallback } from 'grammy';
import { supabase } from '../src/database/db.js';
import { startDialog, handleAnswer } from '../src/handlers/dialog.js';
import { handleButtonPress } from '../src/handlers/buttons.js';
import { showMainMenu, handleMenu } from '../src/handlers/menu.js';

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

// Обработка команды /start
bot.command('start', async (ctx) => {
    await showMainMenu(ctx);
});

// Обработка текстовых сообщений
bot.on('message:text', async (ctx) => {
    await handleAnswer(ctx);
});

// Обработка нажатий на кнопки
bot.on('callback_query', async (ctx) => {
    const callbackData = ctx.callbackQuery.data;

    // Если нажата кнопка из меню, обрабатываем её
    if (callbackData.startsWith('start_')) {
        await handleMenu(ctx);
    } else {
        // Иначе, передаем управление в старый обработчик
        await handleButtonPress(ctx);
    }
});

// Vercel будет использовать эту функцию для обработки запросов
export default async (req, res) => {
    try {
        if (req.method === 'POST') {
            await bot.init();
            const handler = webhookCallback(bot, 'http');
            await handler(req, res);
        } else {
            res.status(200).send('Bot is running');
        }
    } catch (error) {
        console.error('Ошибка в обработчике Vercel:', error);
        res.status(500).send('Внутренняя ошибка сервера');
    }
};
