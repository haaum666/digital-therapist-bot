import { startDialog, handleAnswer } from "./dialog.js";
import { reverseBlockMap } from "../data/blocks.js";

const handleButtonPress = async (ctx) => {
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
        await handleAnswer(ctx);
    }
};

export { handleButtonPress };
