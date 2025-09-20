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

    // Если нажата кнопка с названием блока
    if (buttonData.startsWith("block_")) {
        const shortId = buttonData.substring(6);
        const blockName = reverseBlockMap[shortId];
        await startDialog(ctx, "block_diagnosis", blockName);
    }
    // Если нажата кнопка-ответ на вопрос
    else {
        // Мы теперь передаем handleAnswer весь объект callbackQuery,
        // чтобы получить доступ к message.text и другим данным,
        // а также к id ответа.
        await handleAnswer(ctx);
    }
};

export { handleButtonPress };
