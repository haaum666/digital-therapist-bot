// src/handlers/menu.js
import { startDialog } from "./dialog.js";

// Главное меню
const showMainMenu = async (ctx) => {
    await ctx.reply(`Привет! Я Digital-терапевт для бизнеса. Моя задача - найти слабые места в цифровой инфраструктуре твоей компании и помочь раскрыть её потенциал. Давай начнём?`, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Начать диагностику', callback_data: 'show_diagnosis_menu' },
                ],
                [
                    { text: 'О компании', callback_data: 'about_company' },
                    { text: 'Блог', callback_data: 'blog' },
                    { text: 'Контакты', callback_data: 'contacts' },
                ],
            ],
        },
    });
};

// Меню выбора типа диагностики
const showDiagnosisMenu = async (ctx) => {
    await ctx.reply(`Доступно два режима диагностики: полная - последовательно проходим все блоки за 10–15 минут, и модульная - можно выбрать только один нужный блок, например автоматизацию или маркетинг.`, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📈 Полная диагностика', callback_data: 'start_full_diagnosis' },
                ],
                [
                    { text: '🧩 Модульная диагностика', callback_data: 'start_block_diagnosis' },
                ],
            ],
        },
    });
};

const handleMenu = async (ctx) => {
    const callbackData = ctx.callbackQuery.data;

    switch (callbackData) {
        case 'show_diagnosis_menu':
            // Переход к меню выбора диагностики
            await showDiagnosisMenu(ctx);
            break;

        case 'start_full_diagnosis':
            // Запуск полной диагностики
            await startDialog(ctx, 'full_diagnosis');
            break;

        case 'start_block_diagnosis':
            // Запуск диагностики по блокам
            await startDialog(ctx, 'block_diagnosis');
            break;

        case 'about_company':
            // Заглушка для кнопки "О компании"
            await ctx.reply('Здесь будет информация о компании.');
            break;

        case 'blog':
            // Заглушка для кнопки "Блог"
            await ctx.reply('Здесь будут ссылки на блог.');
            break;

        case 'contacts':
            // Заглушка для кнопки "Контакты"
            await ctx.reply('Здесь будет контактная информация.');
            break;

        default:
            // Обработка других кнопок
            break;
    }
};

export { showMainMenu, handleMenu, showDiagnosisMenu };
