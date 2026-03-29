import telebot
import requests
import threading
import time
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BACKEND_URL = 'http://back:8080/api/nodes'
BOT_TOKEN = os.getenv('BOT_TOKEN', '7142898761:AAEXwGlfohr2dZL56CxSOrX1pNMX8DIT450')

monitored_chat = None
previous_statuses = {}
down_since = {}

# Увеличиваем таймауты для лучшей стабильности
bot = telebot.TeleBot(BOT_TOKEN, threaded=True)
bot.request_handler_timeout = 30
bot.read_timeout = 30

def monitor():
    while True:
        if monitored_chat:
            try:
                response = requests.get(BACKEND_URL, timeout=10)
                response.raise_for_status()
                data = response.json()
                if isinstance(data, list):
                    for node in data:
                        node_id = node.get('id')
                        current_status = node.get('isUp', False)
                        if current_status != previous_statuses.get(node_id, True):  # статус изменился
                            if not current_status:  # стал недоступен
                                down_since[node_id] = time.time()
                            else:  # восстановился
                                if node_id in down_since:
                                    del down_since[node_id]
                        previous_statuses[node_id] = current_status
                        # Проверяем, если недоступен более 1 минуты
                        if not current_status and node_id in down_since and time.time() - down_since[node_id] >= 60:
                            try:
                                bot.send_message(monitored_chat, f"Узел с [IP: {node.get('ip', 'unknown')} | tag: {node.get('tag', 'unknown')}] не отвечает")
                            except Exception as send_err:
                                logger.warning(f"Ошибка отправки сообщения: {send_err}")
                            del down_since[node_id]  # чтобы не повторять уведомление
            except Exception as e:
                logger.warning(f"Ошибка мониторинга: {e}")
        time.sleep(10)  # Проверка каждые 10 секунд

@bot.message_handler(commands=['start'])
def start(message):
    global monitored_chat
    monitored_chat = message.chat.id
    bot.send_message(message.chat.id, "Мониторинг узлов запущен. Уведомления будут отправляться при падении узлов.")


# Запуск мониторинга в отдельном потоке
threading.Thread(target=monitor, daemon=True).start()

# Polling с обработкой таймаутов
logger.info("Запуск Telegram бота...")
while True:
    try:
        bot.polling(non_stop=True, timeout=30)
    except Exception as e:
        logger.warning(f"Ошибка polling: {e}. Переподключение через 5 секунд...")
        time.sleep(5) 