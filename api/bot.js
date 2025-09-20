import { Bot, webhookCallback } from 'grammy';
import { supabase } from '../src/database/db.js';
import { startDialog, handleAnswer } from '../src/handlers/dialog.js';
import { handleButtonPress } from '../src/handlers/buttons.js';
import { showMainMenu, handleMenu } from '../src/handlers/menu.js';
import { handleAbout } from '../src/handlers/about.js'; // Добавил импорт
import { handleBlog } from '../src/handlers/blog.js'; // Добавил импорт
import { handleContacts } from '../src/handlers/contacts.js'; // Добавил импорт

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

    // Проверяем, является ли нажатая кнопка частью главного или диагностического меню
    if (callbackData.startsWith('show_diagnosis_menu') || callbackData.startsWith('start_')) {
        await handleMenu(ctx);
    } else if (callbackData === 'about_company') {
        await handleAbout(ctx);
    } else if (callbackData === 'blog') {
        await handleBlog(ctx);
    } else if (callbackData === 'contacts') {
        await handleContacts(ctx);
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
