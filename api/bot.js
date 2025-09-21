import { Bot, webhookCallback, InlineKeyboard } from 'grammy';
import { startDialog, handleAnswer } from '../src/handlers/dialog.js';
import { handleShowMainMenu, handleShowDiagnosisMenu } from '../src/handlers/menu.js';
import { handleAbout } from '../src/handlers/about.js'; // <-- Добавлен импорт
import { handleBlog } from '../src/handlers/blog.js';   // <-- Добавлен импорт
import { handleContacts } from '../src/handlers/contacts.js'; // <-- Добавлен импорт
import { blocks } from '../src/data/blocks.js';

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

// Обработка команды /start
bot.command('start', async (ctx) => {
    await handleShowMainMenu(ctx);
});

// Обработка нажатий на кнопки
bot.on('callback_query', async (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    await ctx.answerCallbackQuery();

    switch (callbackData) {
        case 'show_main_menu':
            await handleShowMainMenu(ctx);
            break;
        case 'show_diagnosis_menu':
            await handleShowDiagnosisMenu(ctx);
            break;
        case 'about_company':
            await handleAbout(ctx); // <-- Изменено здесь
            break;
        case 'blog':
            await handleBlog(ctx); // <-- Изменено здесь
            break;
        case 'contacts':
            await handleContacts(ctx); // <-- Изменено здесь
            break;
        case 'start_full_diagnosis':
            await startDialog(ctx, 'full_diagnosis');
            break;
        case 'start_block_diagnosis':
            const blockButtons = blocks.map((block) => ({
                text: block,
                callback_data: `block_${block}`,
            }));
            const inlineKeyboard = new InlineKeyboard();
            for (const button of blockButtons) {
                inlineKeyboard.row(InlineKeyboard.text(button.text, button.callback_data));
            }
            await ctx.reply('Выберите блок для диагностики:', {
                reply_markup: inlineKeyboard
            });
            break;
        default:
            // Если ни один из стандартных вариантов не сработал, передаем управление в обработчик ответов на вопросы
            await handleAnswer(ctx);
            break;
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
