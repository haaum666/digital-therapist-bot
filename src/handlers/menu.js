// src/handlers/menu.js
import { showMainMenu, showDiagnosisMenu } from "../utils/menu.js";

// Эти функции теперь просто вызывают функции из общего файла
const handleShowMainMenu = async (ctx) => {
    await showMainMenu(ctx);
};

const handleShowDiagnosisMenu = async (ctx) => {
    await showDiagnosisMenu(ctx);
};

export { handleShowMainMenu, handleShowDiagnosisMenu };
