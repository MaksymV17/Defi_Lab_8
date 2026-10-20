# Міжмережеве повідомлення Sepolia -> Arbitrum Sepolia (Chainlink CCIP)
Автор: Вертій Максим Олександрович

Контракти: CrossChainMessenger (Sepolia, відправник), CrossChainReceiver (Arbitrum Sepolia, отримувач).

Порядок: див. інструкцію в чаті.
1. npm install, скопіювати .env.example у .env та заповнити
2. npm run build
3. npm run deploy:receiver   (Arbitrum Sepolia)
4. npm run deploy:messenger  (Sepolia)
5. npm run fund              (переказ LINK на Messenger)
6. npm run send              (відправка; виводить посилання на CCIP Explorer)
7. npm run check             (перевірка доставки в Arbitrum Sepolia)
