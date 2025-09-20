// src/handlers/blog.js
const handleBlog = async (ctx) => {
    await ctx.reply(
        `Здесь вы можете найти полезные статьи и кейсы по цифровизации бизнеса:
https://quantumdev.ru/blog`
    );
};

export { handleBlog };
