## Discordbotでやりたいこと
- コメントを読み上げる
- VCに誰が入って出たかの通知
- 一定時間待機後に通知して誤爆を抑制する
- 画面共有の通知

## Praxiの課題
- TypeScriptに移行したい
    - データ型を明示してコードを分かりやすくしたい
## 作り方
参考 https://qiita.com/0xkei10/items/ac906d50a922dbbfbcea

### 必要なパッケージ
- Node.js
  - TypeScript
  - ts-node
    - TypeScriptをJavaScriptに変換せずそのまま実行するためのモジュール
  - eslint
    - JavaScriptをきれいに書いたり，バグを発見してくれるツール
  - discord.js
    - discordのボットをJavaScriptで作るためのもの
  - dotenv
    - アドミン専用のデータを保持したりするツール

```
//package.jsonを簡単に作成できます．-yをつけることで質問を回避できます．
> npm init -y 
//TypeScript，ts-node，eslintをローカルインストールします．
> npm install --save-dev typescript ts-node eslint
//discord.js，dotenvのインストール
> npm install discord.js dotenv
```

tsconfig.json を生成する
```
npx tsc --init
```

tsconfig.json を編集する
JavaScriptを出力するディレクトリを./buildに指定
```
"outDir": "./build",
```

ESLintのセットアップ
```
npx eslint --init
```

セットアップウィザードが立ち上がる
```
You can also run this command directly using 'npm init @eslint/config@latest'.

> discordbot@1.0.0 npx
> create-config

@eslint/create-config: v1.4.0

√ How would you like to use ESLint? · problems
√ What type of modules does your project use? · esm
√ Which framework does your project use? · none
√ Does your project use TypeScript? · typescript
√ Where does your code run? · node
The config that you've selected requires the following dependencies:

eslint, globals, @eslint/js, typescript-eslint
√ Would you like to install them now? · No / Yes
√ Which package manager do you want to use? · npm
☕️Installing...

added 31 packages, changed 1 package, and audited 159 packages in 3s

44 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
Successfully created C:\Users\Komame\Works\DiscordBot\eslint.config.mjs file.
```

package.jsonを以下の通り編集
```
"scripts":{
    "test": "ts-node src/main.ts",
	"start": "node build/main.js",
	"compile": "tsc -p ."
}
```

- **srcフォルダ**：本体となるTypeScriptファイルを保持する場所
- **buildフォルダ**：JavaScriptコードを出力する場所
- **.envファイル**：トークン番号やAPI鍵など，機密情報を保持

```
npm run compile
npm run start

```

```
src/main.ts:34:29 - error TS2339: Property 'send' does not exist on type 'DMChannel | PartialDMChannel | PartialGroupDMChannel | NewsChannel | StageChannel | TextChannel | PublicThreadChannel<...> | PrivateThreadChannel | VoiceChannel'.
  Property 'send' does not exist on type 'PartialGroupDMChannel'.

34             message.channel.send(date1.toLocaleString());
                               ~~~~


Found 1 error in src/main.ts:34
```

## Discordでの連携

https://xenfo.org/blog/life/2023-11-01/