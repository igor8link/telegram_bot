import asyncio
import json
import logging
from pathlib import Path

from aiogram import Bot, Dispatcher, types
from aiogram.client.bot import DefaultBotProperties
from aiogram.types import WebAppInfo, Message
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.filters import CommandStart, Command

BOT_TOKEN = "7790107074:AAHxjUShcQnwZPht_M49CYC8kGThHVJS5UU" 
USERS_FILE = Path("users.json")  

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)

bot = Bot(
    token=BOT_TOKEN,
    default=DefaultBotProperties(parse_mode="HTML")
)
dp = Dispatcher()

def load_user_ids() -> set[int]:
    if not USERS_FILE.exists():
        return set()

    try:
        data = json.loads(USERS_FILE.read_text(encoding="utf-8"))
        return set(data)
    except Exception:
        logging.exception("Не удалось загрузить users.json, пустой набор")
        return set()


def save_user_ids(user_ids: set[int]) -> None:
    try:
        USERS_FILE.write_text(
            json.dumps(list(user_ids), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    except Exception:
        logging.exception("Не удалось сохранить users.json")

# Кнопка запуска
@dp.message(CommandStart())
async def start_handler(message: Message):
    user_id = message.from_user.id

    user_ids = load_user_ids()
    if user_id not in user_ids:
        user_ids.add(user_id)
        save_user_ids(user_ids)
        logging.info(f"Добавлен новый пользователь: {user_id}")
    else:
        logging.info(f"Пользователь {user_id} уже есть в списке")

    kb = InlineKeyboardBuilder()
    kb.button(
        text="Открыть Web App",
        web_app=WebAppInfo(url="https://igor8link.github.io/"),
    )
    await message.answer(
        "Добро пожаловать в Kiddzone! Нажмите кнопку ниже, чтобы открыть приложение o(^▽^)o",
        reply_markup=kb.as_markup(),
    )

# Кнопка отписки от рассылки
@dp.message(Command(commands=["stop"]))
async def stop_handler(message: Message):
    user_id = message.from_user.id
    user_ids = load_user_ids()
    if user_id in user_ids:
        user_ids.remove(user_id)
        save_user_ids(user_ids)
        await message.answer("Вы отписались от рассылки")
        logging.info(f"Пользователь {user_id} отписался от рассылки")
    else:
        await message.answer("Вы и так не были подписаны на рассылку ψ(._. )>")

async def broadcast_loop():
    await asyncio.sleep(1)

    while True:
        user_ids = load_user_ids()
        if not user_ids:
            logging.info("Список пользователей пуст, пропускаю рассылку.")
        else:
            logging.info(f"Начинаю рассылку для {len(user_ids)} пользователей.")
        to_remove = set()

        for uid in user_ids:
            try:
                kb = InlineKeyboardBuilder()
                kb.button(
                    text="Открыть Web App",
                    web_app=WebAppInfo(url="https://igor8link.github.io/"),
                )
                await bot.send_message(
                    chat_id=uid,
                    text="Стильные образы для вашего ребёнка на каждый день. Низкие цены и высокое качество. Спешите за покупками!",
                    reply_markup=kb.as_markup(),
                )
                # Небольшая задержка, чтобы не нарушать лимит ~20 msg/sec
                await asyncio.sleep(0.05)
            except Exception as e:
                logging.warning(f"Не получилось отправить {uid}: {e}")
                to_remove.add(uid)

        if to_remove:
            updated = user_ids.difference(to_remove)
            save_user_ids(updated)
            logging.info(f"Удалил из списка (закрыли бота/удалили чат): {to_remove}")

        # Ждём 120 секунд до следующей итерации
        await asyncio.sleep(120)


async def on_startup():
    logging.info("Бот запущен, запускаю фоновую задачу рассылки.")
    asyncio.create_task(broadcast_loop())


async def main():
    dp.startup.register(on_startup)
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        logging.info("Старт бота...")
        asyncio.run(main())
    finally:
        logging.info("Выход, закрываю сессию бота...")
        asyncio.run(bot.session.close())
