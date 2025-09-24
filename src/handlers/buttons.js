import { startDialog, handleAnswer } from "./dialog.js";
import { reverseBlockMap } from "../data/blocks.js";

const handleButtonPress = async (ctx) => {
    await ctx.answerCallbackQuery();
    const buttonData = ctx.callbackQuery.data;
    
    // 1. Обработка кнопки "Полная диагностика"
    if (buttonData === "full_diagnosis") {
        await startDialog(ctx, "full_diagnosis");
    }
    // 2. Если нажата кнопка с названием блока (Проверка по блокам)
    else if (buttonData.startsWith("block_")) {
        const shortId = buttonData.substring(6);
        const blockName = reverseBlockMap[shortId];
        await startDialog(ctx, "block_diagnosis", blockName);
    }
    // 3. Обработка кнопки "Продолжить" после рекомендации
    else if (buttonData.startsWith("continue_dialog_")) {
        // Извлекаем ID следующего вопроса из callback_data
        const nextQuestionId = buttonData.substring("continue_dialog_".length);
        // Вызываем handleAnswer, передавая ID следующего вопроса
        await handleAnswer(ctx, nextQuestionId);
    }
    // 4. Если нажата любая другая кнопка, считаем ее ответом на вопрос
    else {
        await handleAnswer(ctx);
    }
};

export { handleButtonPress };
