import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div>
      <h1>風の漫画</h1>
      <p>Kaze no Manga — Never lose your place in manga again</p>
    </div>
  );
}
