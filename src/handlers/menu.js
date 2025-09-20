// src/handlers/menu.js
import { startDialog } from "./dialog.js";

const showMainMenu = async (ctx) => {
    await ctx.reply(`Здравствуйте! Я Digital-терапевт для бизнеса, и готов провести быструю диагностику вашего бизнеса. Мы можем пойти двумя путями: Полная диагностика или Проверка по блокам.`, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Полная диагностика', callback_data: 'start_full_diagnosis' },
                ],
                [
                    { text: 'Проверка по блокам', callback_data: 'start_block_diagnosis' },
                ],
            ],
        },
    });
};

const handleMenu = async (ctx) => {
    const callbackData = ctx.callbackQuery.data;

    switch (callbackData) {
        case 'start_full_diagnosis':
            await ctx.deleteMessage(); // Удаляем сообщение с кнопками
            await startDialog(ctx, 'full_diagnosis');
            break;
        case 'start_block_diagnosis':
            await ctx.deleteMessage();
            await startDialog(ctx, 'block_diagnosis');
            break;
        default:
            // Обработка других кнопок
            break;
    }
};

export { showMainMenu, handleMenu };
