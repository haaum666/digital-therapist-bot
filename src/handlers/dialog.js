import { supabase } from "../database/db.js";
import { blocks } from "../data/blocks.js";
import { showMainMenu } from "../utils/menu.js";

// Импортируем вопросы из всех 12 файлов, переименованных в латиницу
import { zeroLevelQuestions } from "../data/zero_level_web_presence.js";
import { seoQuestions } from "../data/seo_organic_search.js";
import { mobileQuestions } from "../data/mobile_apps.js";
import { adsAndTrafficQuestions } from "../data/ads_traffic.js";
import { crmAndSalesQuestions } from "../data/crm_sales.js";
import { automationQuestions } from "../data/automation_processes.js";
import { ecommerceQuestions } from "../data/e_commerce.js";
import { fintechQuestions } from "../data/finance_fintech.js";
import { cybersecurityQuestions } from "../data/cybersecurity.js";
import { hrQuestions } from "../data/hr_internal_infra.js";
import { marketingQuestions } from "../data/communications_marketing.js";
import { newTechQuestions } from "../data/new_technologies.js";

// Объединяем все вопросы в один объект для удобного доступа
// Ключи объекта изменены в соответствии с массивом blocks.js
const allQuestions = {
    "Сайт и цифровизация": zeroLevelQuestions,
    "SEO оптимизация": seoQuestions,
    "Мобильные приложения": mobileQuestions,
    "Реклама и трафик": adsAndTrafficQuestions,
    "CRM и продажи": crmAndSalesQuestions,
    "Автоматизация и процессы": automationQuestions,
    "Интернет-магазин": ecommerceQuestions,
    "Финансы": fintechQuestions,
    "Кибербезопасность": cybersecurityQuestions,
    "HR-процессы": hrQuestions,
    "Цифровой маркетинг": marketingQuestions,
    "Новые технологии": newTechQuestions,
};

const sendNextQuestion = async (ctx, nextBlock, nextQuestion, userData) => {
    let replyText = "";
    let buttons = null;

    if (!nextBlock) {
        // Если это последний блок, завершаем диагностику
        await ctx.reply("Диагностика завершена. Спасибо за ответы!");
        await ctx.reply("Отчет готов! Чтобы получить его, пожалуйста, обратитесь к менеджеру.");
        
        // Сбрасываем статус
        await supabase
            .from("diagnostics")
            .update({ status: null, current_block: null, current_question: null })
            .eq("user_id", ctx.from.id);

        await showMainMenu(ctx);
        return;
    }

    const nextQuestionData = allQuestions[nextBlock].find(q => q.id === nextQuestion);
    replyText = nextQuestionData.text;

    buttons = Object.keys(nextQuestionData.answers || {}).map(key => [{ text: key, callback_data: nextQuestionData.answers[key].id }]);

    // Обновляем базу данных
    const { error: updateError } = await supabase
        .from("diagnostics")
        .update({
            answers: userData.answers,
            problem_summary: userData.problem_summary,
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
};

const startDialog = async (ctx, diagnosisType, blockName) => {
    let firstBlock = blocks[0];
    let firstQuestionId = allQuestions[firstBlock][0].id;
    let status = "full_diagnosis";

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

    const menuButtonIds = ['show_main_menu', 'show_diagnosis_menu', 'contacts', 'blog', 'about_company', 'start_diagnosis'];

    if (menuButtonIds.includes(userAnswerId)) {
        return;
    }

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

    const { status, current_block, current_question, answers, problem_summary } = userData;

    if (status !== "full_diagnosis" && status !== "block_diagnosis") {
        return;
    }

    const currentBlockQuestions = allQuestions[current_block];
    const currentQuestionData = currentBlockQuestions.find((q) => q.id === current_question);

    const answerKey = Object.keys(currentQuestionData.answers).find(
        key => currentQuestionData.answers[key].id === userAnswerId
    );

    if (!answerKey) {
        console.error("Ответ с таким ID не найден:", userAnswerId);
        return;
    }

    const answerData = currentQuestionData.answers[answerKey];
    const nextQuestionId = answerData.next;
    const recommendation = answerData.recommendation;
    
    // ИСПРАВЛЕННАЯ СТРОКА: Имя переменной `current_question` теперь верное
    console.log("-----------------------------------------");
    console.log("Текущий вопрос:", current_question);
    console.log("Текущий блок:", current_block);
    console.log("ID ответа:", userAnswerId);
    console.log("Значение nextQuestionId:", nextQuestionId);
    console.log("Наличие рекомендации:", !!recommendation);
    console.log("-----------------------------------------");

    const updatedAnswers = { ...answers };
    updatedAnswers[current_block] = {
        ...updatedAnswers[current_block],
        [current_question]: answerKey,
    };

    const updatedProblemSummary = [...problem_summary];
    
    if (recommendation) {
        updatedProblemSummary.push(recommendation);
        
        const buttons = [
            [{ text: 'Оставить заявку', url: 'https://t.me/Quantumdevelop' }],
            [{ text: 'Вернуться в начало', callback_data: 'show_main_menu' }],
        ];

        if (nextQuestionId) {
            buttons.push([{ text: 'Продолжить', callback_data: `continue_dialog_${nextQuestionId}` }]);
        }
        
        await ctx.reply(recommendation.text, {
            reply_markup: {
                inline_keyboard: buttons,
            },
        });
        
        return;
    }

    const nextBlock = nextQuestionId === null && status === "full_diagnosis"
        ? blocks[blocks.indexOf(current_block) + 1]
        : current_block;

    const nextQuestion = nextQuestionId === null && status === "full_diagnosis"
        ? allQuestions[nextBlock]?.[0]?.id
        : nextQuestionId;

    const updatedUserData = {
        ...userData,
        answers: updatedAnswers,
        problem_summary: updatedProblemSummary,
    };

    await sendNextQuestion(ctx, nextBlock, nextQuestion, updatedUserData);
};

export { startDialog, handleAnswer };
