import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-red-700">
      <Head>
        <title>Khet Khaliyan</title>
        <meta name="theme-color" content="#000000" />
      </Head>
      <div className="text-center">
        <div className="text-6xl font-extrabold tracking-wide animate-pulse">S.S.</div>
        <div className="mt-6 text-3xl text-red-600">SHREYANSH SAHU</div>
        <div className="mt-2 text-sm text-gray-300">Presented by Shreyansh Sahu</div>
        <div className="mt-10">
          <Link href="/about" className="px-6 py-3 bg-red-700 text-white rounded-md">Enter</Link>
        </div>
      </div>
    </main>
  );
}