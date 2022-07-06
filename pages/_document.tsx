import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <title>Mongo Admin</title>
        <meta name="description" content="Admin for MongoDB" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" as="style" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.4/dist/web/static/pretendard-dynamic-subset.css" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}