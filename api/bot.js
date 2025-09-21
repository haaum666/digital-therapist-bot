import { Bot, webhookCallback, InlineKeyboard } from 'grammy';
import { startDialog, handleAnswer } from '../src/handlers/dialog.js';
import { handleShowMainMenu, handleShowDiagnosisMenu } from '../src/handlers/menu.js';
import { handleAbout } from '../src/handlers/about.js';
import { handleBlog } from '../src/handlers/blog.js';
import { handleContacts } from '../src/handlers/contacts.js';
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

    // Новая логика для кнопки "Продолжить"
    if (callbackData.startsWith('continue_dialog_')) {
        const nextQuestionId = callbackData.split('_')[2];
        await handleAnswer(ctx, nextQuestionId); // Передаем следующий вопрос в обработчик
        return;
    }

    switch (callbackData) {
        case 'show_main_menu':
            await handleShowMainMenu(ctx);
            break;
        case 'show_diagnosis_menu':
            await handleShowDiagnosisMenu(ctx);
            break;
        case 'about_company':
            await handleAbout(ctx);
            break;
        case 'blog':
            await handleBlog(ctx);
            break;
        case 'contacts':
            await handleContacts(ctx);
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
