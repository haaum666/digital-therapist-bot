import { supabase } from "../database/db.js";
import { blocks } from "../data/blocks.js";

// Импортируем вопросы из всех 12 файлов
import { zeroLevelQuestions } from "../data/Нулевой_уровень_и_веб-присутствие.js";
import { seoQuestions } from "../data/SEO_и_органический_поиск.js";
import { mobileQuestions } from "../data/Мобильные_приложения.js";
import { adsAndTrafficQuestions } from "../data/Реклама_и_трафик.js";
import { crmAndSalesQuestions } from "../data/CRM_и_продажи.js";
import { automationQuestions } from "../data/Автоматизация_и_процессы.js";
import { ecommerceQuestions } from "../data/E-commerce.js";
import { fintechQuestions } from "../data/Финансы_и_финтех.js";
import { cybersecurityQuestions } from "../data/Кибербезопасность.js";
import { hrQuestions } from "../data/HR_и_внутренняя_инфраструктура.js";
import { marketingQuestions } from "../data/Коммуникации_и_маркетинг.js";
import { newTechQuestions } from "../data/Новые_технологии.js";

// Объединяем все вопросы в один объект для удобного доступа
const allQuestions = {
    "Нулевой уровень и веб-присутствие": zeroLevelQuestions,
    "SEO и органический поиск": seoQuestions,
    "Мобильные приложения": mobileQuestions,
    "Реклама и трафик": adsAndTrafficQuestions,
    "CRM и продажи": crmAndSalesQuestions,
    "Автоматизация и процессы": automationQuestions,
    "E-commerce": ecommerceQuestions,
    "Финансы и финтех": fintechQuestions,
    "Кибербезопасность": cybersecurityQuestions,
    "HR и внутренняя инфраструктура": hrQuestions,
    "Коммуникации и маркетинг": marketingQuestions,
    "Новые технологии": newTechQuestions,
};

// Функция для генерации HTML-отчета
const generateReportHtml = (userData) => {
    const problemSummaryHtml = userData.problem_summary
        .map(
            (problem) => `
            <div class="problem-item">
              <p class="problem-title">${problem.title}</p>
              <p class="problem-description">${problem.text}</p>
            </div>
          `
        )
        .join("");

    return `
          <!DOCTYPE html>
          <html lang="ru">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Отчет по диагностике бизнеса</title>
              <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f9; color: #333; padding: 20px; line-height: 1.6; }
                .report-container { background-color: #fff; max-width: 800px; margin: 40px auto; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
                .report-title { color: #4CAF50; text-align: center; font-size: 28px; margin-bottom: 20px; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
                .report-intro, .report-outro { font-size: 16px; margin-bottom: 20px; text-align: justify; }
                .priority-section { margin-bottom: 30px; padding-left: 15px; border-left: 4px solid #ddd; }
                .priority-title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
                .priority-title.самый-высокий-приоритет { color: #D32F2F; border-bottom: 2px solid #D32F2F; padding-bottom: 5px; }
                .priority-title.высокий-приоритет { color: #FF5722; border-bottom: 2px solid #FF5722; padding-bottom: 5px; }
                .priority-title.средний-приоритет { color: #FFC107; border-bottom: 2px solid #FFC107; padding-bottom: 5px; }
                .priority-title.низкий-приоритет { color: #03A9F4; border-bottom: 2px solid #03A9F4; padding-bottom: 5px; }
                .problem-item { background-color: #f9f9f9; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; }
                .problem-title { font-size: 16px; font-weight: bold; color: #555; margin-top: 0; margin-bottom: 5px; }
                .problem-description { font-size: 14px; color: #666; margin-bottom: 0; }
                .cta-button { text-align: center; margin-top: 30px; }
                .cta-button a { background-color: #4CAF50; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 18px; transition: background-color 0.3s ease; }
                .cta-button a:hover { background-color: #45a049; }
              </style>
          </head>
          <body>
              <div class="report-container">
                <h1 class="report-title">Отчет по диагностике бизнеса</h1>
                <div class="report-intro">
                  Ваш отчет готов! Ниже представлены основные проблемы и упущенные возможности, выявленные в ходе диагностики.
                </div>
                ${problemSummaryHtml}
              </div>
          </body>
          </html>
        `;
};

const sendNextQuestion = async (ctx, nextBlock, nextQuestion, updatedAnswers, updatedProblemSummary) => {
    let replyText = "";
    let buttons = null;

    if (!nextBlock) {
        // Если это последний блок, завершаем диагностику
        await ctx.reply("Диагностика завершена. Спасибо за ответы!");

        const { data: userData } = await supabase
            .from("diagnostics")
            .select("*")
            .eq("user_id", ctx.from.id)
            .single();

        const reportHtml = generateReportHtml(userData);
        await ctx.replyWithDocument({
            source: Buffer.from(reportHtml),
            filename: `Отчет_${userData.username}.html`,
        });

        // Сбрасываем статус
        await supabase
            .from("diagnostics")
            .update({ status: null, current_block: null, current_question: null })
            .eq("user_id", ctx.from.id);
        return;
    }

    const nextQuestionData = allQuestions[nextBlock].find(q => q.id === nextQuestion);
    replyText = nextQuestionData.text;

    // Исправлено: теперь мы получаем текст ответа напрямую из ключей объекта answers
    buttons = Object.keys(nextQuestionData.answers || {}).map(key => [{ text: key, callback_data: nextQuestionData.answers[key].id }]);

    // Обновляем базу данных
    const { error: updateError } = await supabase
        .from("diagnostics")
        .update({
            answers: updatedAnswers,
            problem_summary: updatedProblemSummary,
            current_block: nextBlock,
            current_question: nextQuestion,
        })
        .eq("user_id", ctx.from.id);

    if (updateError) {
        console.error("Ошибка при обновлении данных:", updateError);
        await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте начать заново.");
        return;
    }

    const replyOptions = {};
    if (buttons && buttons.length > 0) {
        replyOptions.reply_markup = { inline_keyboard: buttons };
    }

    await ctx.reply(replyText, replyOptions);
}

const startDialog = async (ctx, diagnosisType, blockName) => {
    let firstBlock = blocks[0];
    let firstQuestionId = allQuestions[firstBlock][0].id;
    let status = "full_diagnosis";

    // Если это диагностика по блокам
    if (diagnosisType === "block_diagnosis" && blockName) {
        firstBlock = blockName;
        firstQuestionId = allQuestions[firstBlock][0].id;
        status = "block_diagnosis";
    }

    const { data, error } = await supabase
        .from("diagnostics")
        .upsert(
            {
                user_id: ctx.from.id,
                username: ctx.from.username,
                answers: {},
                problem_summary: [],
                final_report_sent: false,
                status: status,
                current_block: firstBlock,
                current_question: firstQuestionId,
            },
            { onConflict: "user_id" }
        );

    if (error) {
        console.error("Ошибка при создании/обновлении записи:", error);
        return;
    }

    const firstQuestion = allQuestions[firstBlock].find(q => q.id === firstQuestionId);
    const buttons = Object.keys(firstQuestion.answers).map(key => [{ text: key, callback_data: firstQuestion.answers[key].id }]);
    await ctx.reply(firstQuestion.text, {
        reply_markup: {
            inline_keyboard: buttons,
        },
    });
};

const handleAnswer = async (ctx) => {
    const userAnswerId = ctx.callbackQuery.data;

    // Получаем текущие данные пользователя из базы
    const { data: userData, error: fetchError } = await supabase
        .from("diagnostics")
        .select("*")
        .eq("user_id", ctx.from.id)
        .single();

    if (fetchError || !userData) {
        console.error("Ошибка при получении данных пользователя:", fetchError);
        await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте начать заново.");
        return;
    }

    const { status, current_block, current_question, answers, problem_summary } =
        userData;

    // Проверяем, что пользователь находится в режиме диагностики
    if (status !== "full_diagnosis" && status !== "block_diagnosis") {
        return;
    }

    const currentBlockQuestions = allQuestions[current_block];
    const currentQuestionIndex = currentBlockQuestions.findIndex(
        (q) => q.id === current_question
    );
    const currentQuestionData = currentBlockQuestions[currentQuestionIndex];

    // Находим ключ ответа по его ID
    const answerKey = Object.keys(currentQuestionData.answers).find(
        key => currentQuestionData.answers[key].id === userAnswerId
    );

    if (!answerKey) {
      console.error("Ответ с таким ID не найден:", userAnswerId);
      return;
    }

    const answerData = currentQuestionData.answers[answerKey];

    const nextQuestionId = answerData?.next;
    const recommendation = answerData?.recommendation;

    // Добавляем ответ пользователя
    const updatedAnswers = { ...answers };
    updatedAnswers[current_block] = {
        ...updatedAnswers[current_block],
        [current_question]: answerKey,
    };

    // Добавляем рекомендацию, если она есть
    const updatedProblemSummary = [...problem_summary];
    if (recommendation) {
        updatedProblemSummary.push(recommendation);
    }

    let nextBlock = current_block;
    let nextQuestion = nextQuestionId;

    // Если ответа нет, переходим к следующему вопросу по порядку
    if (nextQuestionId === undefined) {
        nextQuestion = currentBlockQuestions[currentQuestionIndex + 1]?.id;
    }

    // Если следующего вопроса в блоке нет, переходим к следующему блоку
    if (nextQuestion === null) {
        const currentBlockIndex = blocks.indexOf(current_block);
        if (status === "full_diagnosis") {
            nextBlock = blocks[currentBlockIndex + 1];
            nextQuestion = allQuestions[nextBlock]?.[0]?.id;
        } else {
            // Если диагностика по блокам, завершаем диалог
            nextBlock = null;
            nextQuestion = null;
        }
    }
    
    // Если вопрос является последним в своем блоке, но не последним в списке, 
    // и это полная диагностика, то переходим к следующему блоку.
    if (nextQuestionId === null && status === "full_diagnosis") {
      const currentBlockIndex = blocks.indexOf(current_block);
      nextBlock = blocks[currentBlockIndex + 1];
      nextQuestion = allQuestions[nextBlock]?.[0]?.id;
    }

    await sendNextQuestion(ctx, nextBlock, nextQuestion, updatedAnswers, updatedProblemSummary);
};

export { startDialog, handleAnswer };
