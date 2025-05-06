// Dynamic metadata for Healthcare page
export const metadata = {
  title: 'Healthcare Assistant | AI Education Platform',
  description: 'Your Personal Healthcare Assistant powered by AI.',
};

export default function Head() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta content={metadata.description} name="description" />
    </>
  );
}
