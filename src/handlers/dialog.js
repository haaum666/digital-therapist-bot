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
        await ctx.reply("Диагностика завершена. Спасибо за ответы!");
        await ctx.reply("Отчет готов! Чтобы получить его, пожалуйста, обратитесь к менеджеру.");
        
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

// ИСПРАВЛЕНИЕ: Функция теперь принимает необязательный параметр nextQuestionIdFromButton
const handleAnswer = async (ctx, nextQuestionIdFromButton = null) => {
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

    let nextQuestion = nextQuestionIdFromButton;
    let nextBlock = current_block;

    // Новая логика: если следующий вопрос уже передан из кнопки "Продолжить",
    // пропускаем поиск в данных и сразу переходим к отправке
    if (!nextQuestionIdFromButton) {
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
        const recommendation = answerData.recommendation;
        
        console.log("-----------------------------------------");
        console.log("Текущий вопрос:", current_question);
        console.log("Текущий блок:", current_block);
        console.log("ID ответа:", userAnswerId);
        console.log("Значение nextQuestionId:", answerData.next);
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

            if (answerData.next) {
                buttons.push([{ text: 'Продолжить', callback_data: `continue_dialog_${answerData.next}` }]);
            }
            
            await ctx.reply(recommendation.text, {
                reply_markup: {
                    inline_keyboard: buttons,
                },
            });
            
            const { error: updateError } = await supabase
                .from("diagnostics")
                .update({
                    answers: updatedAnswers,
                    problem_summary: updatedProblemSummary,
                })
                .eq("user_id", ctx.from.id);
            
            if (updateError) {
                console.error("Ошибка при обновлении данных:", updateError);
            }
            return;
        }

        nextQuestion = answerData.next;
        if (nextQuestion === null && status === "full_diagnosis") {
            nextBlock = blocks[blocks.indexOf(current_block) + 1];
            nextQuestion = allQuestions[nextBlock]?.[0]?.id;
        }
    }

    const updatedUserData = {
        ...userData,
        answers: {
            ...userData.answers,
            [current_block]: {
                ...userData.answers[current_block],
                [current_question]: userAnswerId,
            }
        },
        problem_summary: userData.problem_summary
    };
    
    // Если мы пришли сюда из-за `continue_dialog_`, то userAnswerId был не `a*`
    // и его нужно проигнорировать при сохранении ответа,
    // иначе он будет некорректным.
    if (nextQuestionIdFromButton) {
        delete updatedUserData.answers[current_block][current_question];
    }

    await sendNextQuestion(ctx, nextBlock, nextQuestion, updatedUserData);
};

export { startDialog, handleAnswer };
