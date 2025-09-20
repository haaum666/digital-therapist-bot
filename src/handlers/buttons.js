// src/handlers/buttons.js
import { supabase } from "../database/db.js";
import { blocks } from "../data/blocks.js";
import { startDialog, handleAnswer } from "./dialog.js";

// Создаем короткие ID для каждого блока
const blockMap = blocks.reduce((acc, block, index) => {
    acc[block] = `b${index}`;
    return acc;
}, {});

const reverseBlockMap = Object.entries(blockMap).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
}, {});

const handleButtonPress = async (ctx) => {
    // Убираем анимацию "часов" с кнопки как можно раньше
    await ctx.answerCallbackQuery();

    const buttonData = ctx.callbackQuery.data;

    // Добавляем обработку для кнопки "Модульная диагностика"
    if (buttonData === "start_block_diagnosis") {
        // Создаем кнопки с короткими ID
        const blockButtons = blocks.map((block) => ({
            text: block,
            callback_data: `block_${blockMap[block]}`,
        }));
        await ctx.reply("Выберите блок для диагностики:", {
            reply_markup: {
                inline_keyboard: [
                    blockButtons.slice(0, 2),
                    blockButtons.slice(2, 4),
                    blockButtons.slice(4, 6),
                    blockButtons.slice(6, 8),
                    blockButtons.slice(8, 10),
                    blockButtons.slice(10),
                ],
            },
        });
    }
    // Если нажата кнопка с названием блока
    else if (buttonData.startsWith("block_")) {
        const shortId = buttonData.substring(6);
        const blockName = reverseBlockMap[shortId];
        await startDialog(ctx, "block_diagnosis", blockName);
    }
    // Если нажата кнопка-ответ на вопрос
    else {
        await handleAnswer(ctx);
    }
};

export { handleButtonPress };
